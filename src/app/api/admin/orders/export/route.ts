import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/session';

export async function GET() {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  const rows = [
    ['OrderNumber','Date','Name','Mobile','Email','Address','City','State','Pincode','Product','Size','Qty','PaymentMethod','TotalAmount','PaidNow','COD','Discount','PaymentStatus','OrderStatus','CAPIFired','UTR'].join(','),
    ...orders.flatMap(o => o.items.map(i => [
      o.orderNumber, o.createdAt.toISOString(),
      quote(o.fullName), o.mobile, quote(o.email||''),
      quote(`${o.addressLine1} ${o.addressLine2||''} ${o.landmark ? 'Near '+o.landmark : ''}`),
      quote(o.city), quote(o.state), o.pincode,
      quote(i.productName), i.size, i.quantity,
      o.paymentMethod, o.totalAmount, o.paidAmount, o.codAmount, o.discountAmount,
      o.paymentStatus, o.orderStatus, o.capiFired ? 'YES' : 'NO', o.utr||'',
    ].join(','))),
  ].join('\n');

  return new NextResponse(rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=orders-${new Date().toISOString().slice(0,10)}.csv`,
    },
  });
}

function quote(s: string) { return `"${String(s).replace(/"/g, '""')}"`; }
