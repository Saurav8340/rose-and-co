'use client';
import { useState } from 'react';
import { SITE } from '@/lib/constants';

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true); setOrder(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-x py-16 max-w-xl">
      <h1 className="font-display text-4xl text-ivory text-center">Track your order</h1>
      <p className="text-center text-sm text-ivory/60 mt-2">Order number and mobile. Nothing else needed.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="label">Order number</label>
          <input className="input" placeholder="RC2607123456" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
        </div>
        <div>
          <label className="label">Mobile</label>
          <input className="input" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} required />
        </div>
        {err && <div className="p-3 bg-wine/10 text-crimson text-sm border border-wine/30 rounded">{err}</div>}
        <button disabled={loading} className="btn-primary w-full cursor-pointer">{loading ? 'Looking…' : 'Show my order'}</button>
      </form>

      {order && (
        <div className="mt-8 p-6 border border-taupe/20 bg-blush rounded-lg">
          <div className="text-xs uppercase tracking-widest text-ivory/60">Order</div>
          <div className="font-mono text-lg text-crimson">#{order.orderNumber}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ivory">
            <div><b>Order status</b><br/>{order.status}</div>
            <div><b>Payment status</b><br/>{order.paymentStatus}</div>
            <div><b>Payment method</b><br/>{order.paymentMethod === 'PREPAID' ? 'Full prepaid' : 'Partial COD'}</div>
            <div><b>Placed at</b><br/>{new Date(order.createdAt).toLocaleString('en-IN')}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-taupe/30">
            {order.items.map((i: any, x: number) => (
              <div key={x} className="text-sm text-ivory/80">{i.name} — Size {i.size} × {i.qty}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 text-center text-xs text-ivory/60">
        Can not find your order? Email <a className="underline text-crimson" href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </div>
    </div>
  );
}




