import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/format';
import UpdateOrderForm from './UpdateOrderForm';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  if (!(await verifyAdminSession())) redirect('/admin/login');
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  let utmParsed: Record<string, any> = {};
  if (order.utmData) { try { utmParsed = JSON.parse(order.utmData); } catch {} }

  return (
    <div className="container-x py-8 max-w-4xl">
      <Link href="/admin" className="text-xs uppercase tracking-widest text-ivory/60 hover:text-crimson transition">← Back to orders</Link>
      <h1 className="font-display text-3xl mt-2 text-ivory">Order {order.orderNumber}</h1>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="border border-taupe/20 p-6 bg-blush rounded-lg">
          <h3 className="uppercase tracking-widest text-xs text-ivory/60 mb-3">Customer & shipping</h3>
          <div className="text-sm space-y-1 text-ivory">
            <div><b>{order.fullName}</b></div>
            <div>{order.mobile}{order.altPhone ? ` / ${order.altPhone}` : ''}</div>
            <div>{order.email || '—'}</div>
            <div className="pt-2 border-t border-taupe/20 mt-2">
              {order.addressLine1}<br/>
              {order.addressLine2 && <>{order.addressLine2}<br/></>}
              {order.landmark && <>Near {order.landmark}<br/></>}
              {order.city}, {order.state} — {order.pincode}
            </div>
          </div>
        </div>

        <div className="border border-taupe/20 p-6 bg-blush rounded-lg">
          <h3 className="uppercase tracking-widest text-xs text-ivory/60 mb-3">Payment & items</h3>
          <div className="text-sm space-y-1 text-ivory">
            <div><b>Method:</b> <span className={order.paymentMethod === 'PREPAID' ? 'text-crimson font-semibold' : ''}>{order.paymentMethod}</span></div>
            <div><b>Total:</b> {inr(order.totalAmount)}</div>
            {order.discountAmount > 0 && <div className="text-crimson"><b>UPI discount:</b> -{inr(order.discountAmount)}</div>}
            <div><b>Paid online:</b> {inr(order.paidAmount)}</div>
            <div><b>COD amount:</b> {inr(order.codAmount)}</div>
            <div><b>Payment status:</b> {order.paymentStatus}</div>
            <div><b>CAPI fired:</b> {order.capiFired ? '✓ Sent' : '—'}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-taupe/20">
            {order.items.map(i => (
              <div key={i.id} className="text-sm text-ivory/90">{i.productName} · Size {i.size} × {i.quantity} · {inr(i.price)}</div>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(utmParsed).length > 0 && (
        <div className="mt-6 border border-taupe/20 p-6 bg-blush rounded-lg">
          <h3 className="uppercase tracking-widest text-xs text-ivory/60 mb-3">Attribution (UTM)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
            {Object.entries(utmParsed).filter(([k]) => k !== 'ts').map(([k, v]) => (
              <div key={k} className="p-2 bg-blush/40 border border-taupe/20 rounded">
                <div className="text-ivory/50">{k}</div>
                <div className="text-ivory truncate">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border border-taupe/20 p-6 bg-blush/40 rounded-lg">
        <h3 className="uppercase tracking-widest text-xs text-ivory/60 mb-3">Update order</h3>
        <UpdateOrderForm order={{
          id: order.id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          capiFired: order.capiFired,
          notes: order.notes || '',
          utr: order.utr || '',
        }} />
      </div>
    </div>
  );
}


