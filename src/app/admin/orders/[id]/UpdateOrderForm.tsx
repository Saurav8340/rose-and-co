'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Order = {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  capiFired: boolean;
  notes: string;
  utr: string;
};

export default function UpdateOrderForm({ order }: { order: Order }) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [notes, setNotes] = useState(order.notes);
  const [utr, setUtr] = useState(order.utr);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Preview whether CAPI will fire based on current selections
  const isPrepaid = order.paymentMethod === 'PREPAID';
  const willFireCapi = !order.capiFired && (
    (isPrepaid && paymentStatus === 'VERIFIED') ||
    (!isPrepaid && orderStatus === 'DELIVERED' && paymentStatus === 'VERIFIED')
  );

  const save = async () => {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus, notes, utr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Update failed');
      setMsg(data.capiFired ? 'Saved. Meta CAPI Purchase event sent.' : 'Saved.');
      router.refresh();
    } catch (e: any) { setMsg(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Order status</label>
          <select className="input" value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
            <option>PLACED</option><option>CONFIRMED</option><option>PACKED</option>
            <option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
          </select>
        </div>
        <div>
          <label className="label">Payment status</label>
          <select className="input" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
            <option>PENDING</option><option>VERIFIED</option><option>FAILED</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">UPI transaction ref (UTR) — internal only</label>
        <input className="input font-mono" value={utr} onChange={e => setUtr(e.target.value)} placeholder="Paste the UTR you matched in your UPI app" />
      </div>
      <div>
        <label className="label">Internal notes</label>
        <textarea className="input min-h-[80px]" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* CAPI PREVIEW */}
      <div className={`p-4 border-2 ${willFireCapi ? 'border-green-600 bg-green-50' : order.capiFired ? 'border-green-800 bg-green-100' : 'border-taupe/30 bg-white'}`}>
        <div className="text-xs uppercase tracking-widest text-espresso/70">Meta CAPI status</div>
        {order.capiFired ? (
          <div className="mt-1 text-sm text-green-800 font-medium">✓ Purchase event already sent to Meta.</div>
        ) : willFireCapi ? (
          <div className="mt-1 text-sm text-green-800 font-medium">
            → Saving this will fire Meta CAPI Purchase event now.
            <div className="text-xs mt-1 text-espresso/70">
              Only do this when money is actually in your bank account.
            </div>
          </div>
        ) : (
          <div className="mt-1 text-sm text-espresso/70">
            CAPI will fire when: {isPrepaid ? 'Payment status = VERIFIED' : 'Order status = DELIVERED AND Payment status = VERIFIED'}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : willFireCapi ? 'Save & fire Meta event' : 'Save changes'}
        </button>
        {msg && <span className="text-sm text-green-800">{msg}</span>}
      </div>
    </div>
  );
}
