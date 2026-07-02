'use client';
import { useState } from 'react';

const METRO_PINS = ['400', '110', '560', '600', '500', '411', '700'];

export default function PincodeCheck() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<{ city: string; state: string; days: string; from: string; to: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setErr(null); setResult(null);
    if (!/^[1-9]\d{5}$/.test(pin)) return setErr('Enter a valid 6-digit PIN');
    setLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status !== 'Success' || !data[0].PostOffice?.[0]) {
        setErr('We could not find this PIN. Try again or email us.');
        return;
      }
      const po = data[0].PostOffice[0];
      const isMetro = METRO_PINS.some(m => pin.startsWith(m));
      const minDays = isMetro ? 3 : 5;
      const maxDays = isMetro ? 5 : 7;
      const now = new Date();
      const fromDate = new Date(now.getTime() + minDays * 24 * 60 * 60_000);
      const toDate   = new Date(now.getTime() + maxDays * 24 * 60 * 60_000);
      const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      setResult({
        city: po.District, state: po.State,
        days: `${minDays}–${maxDays} days`,
        from: fmt(fromDate), to: fmt(toDate),
      });
    } catch { setErr('Could not check right now. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="border-t border-taupe/20 pt-4">
      <div className="text-xs uppercase tracking-widest text-espresso mb-2">Check delivery date</div>
      <div className="flex gap-2">
        <input inputMode="numeric" maxLength={6} value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter PIN code" className="input flex-1" />
        <button onClick={check} disabled={loading} className="btn-secondary px-4">
          {loading ? '…' : 'Check'}
        </button>
      </div>
      {err && <div className="mt-2 text-xs text-wine">{err}</div>}
      {result && (
        <div className="mt-3 p-3 bg-blush/30 border-l-2 border-wine text-sm text-espresso">
          <div>Delivering to <b>{result.city}, {result.state}</b></div>
          <div className="mt-1">Arrives by <b>{result.from} – {result.to}</b> ({result.days})</div>
          <div className="mt-1 text-xs text-espresso/60">Free shipping. Ships from Delhi NCR in 24–48 hours.</div>
        </div>
      )}
    </div>
  );
}
