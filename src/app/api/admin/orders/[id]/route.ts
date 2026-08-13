import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/session';
import { sendPurchaseCapi } from '@/lib/metaCapi';
import { SITE } from '@/lib/constants';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.orderStatus)   data.orderStatus   = String(body.orderStatus);
  if (body.paymentStatus) data.paymentStatus = String(body.paymentStatus);
  if (typeof body.notes === 'string') data.notes = body.notes;
  if (typeof body.utr === 'string')   data.utr = body.utr;

  const before = await prisma.order.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const after = await prisma.order.update({ where: { id: params.id }, data });

  await prisma.adminLog.create({
    data: { action: 'update_order', metadata: JSON.stringify({ id: params.id, ...data }) },
  });

  // ============================================================
  // CAPI FIRING RULE
  // ============================================================
  let capiFired = false;
  if (!after.capiFired) {
    const isPrepaidVerified = after.paymentMethod === 'PREPAID'
      && after.paymentStatus === 'VERIFIED';
    const isCodDeliveredAndPaid = after.paymentMethod === 'PARTIAL_COD'
      && after.orderStatus === 'DELIVERED'
      && after.paymentStatus === 'VERIFIED';

    if (isPrepaidVerified || isCodDeliveredAndPaid) {
      const value = after.paymentMethod === 'PREPAID' ? after.paidAmount : after.totalAmount;

      // Extract original IP and UA from notes (stored as JSON at order creation)
      let clientIp: string | null = null;
      let clientUa: string | null = null;
      if (after.notes) {
        try {
          const parsed = JSON.parse(after.notes);
          if (parsed.ip) clientIp = String(parsed.ip);
          if (parsed.ua) clientUa = String(parsed.ua);
        } catch {
          // notes may be free-text (from admin edits) — safe to skip
        }
      }

      sendPurchaseCapi({
        orderNumber: after.orderNumber,
        paidAmount:  after.paidAmount,
        valueOverride: value,
        email:       after.email,
        mobile:      after.mobile,
        fullName:    after.fullName,
        city:        after.city,
        state:       after.state,
        pincode:     after.pincode,
        metaFbc:     after.metaFbc,
        metaFbp:     after.metaFbp,
        utmData:     after.utmData,
        createdAt:   after.createdAt,
        clientIp,
        clientUa,
        eventSourceUrl: SITE.url + '/product/amara-marble-swirl-coord-set',
      }).catch(err => console.error('[CAPI] Send failed:', err));

      await prisma.order.update({
        where: { id: after.id },
        data:  { capiFired: true },
      });

      await prisma.adminLog.create({
        data: {
          action:   'capi_purchase_sent',
          metadata: JSON.stringify({
            orderNumber:  after.orderNumber,
            paymentMethod: after.paymentMethod,
            value,
            hasIp: !!clientIp,
            hasUa: !!clientUa,
          }),
        },
      });
      capiFired = true;
    }
  }

  return NextResponse.json({ ok: true, capiFired });
}


