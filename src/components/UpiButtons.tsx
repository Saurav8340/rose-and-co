'use client';
import { UPI } from '@/lib/constants';

type App = { id: string; name: string; short: string; bg: string; fg: string; scheme: (p: string) => string; };

// Real brand colors for each payment app — kept exactly as-is intentionally.
// These are factual brand identities (GPay's gradient, PhonePe purple, etc.),
// not part of your site's theme, so they should NOT be recolored to match
// Rosé & Co's palette.
const APPS: App[] = [
  { id: 'gpay', name: 'Google Pay', short: 'GPay',
    bg: 'linear-gradient(135deg,#4285F4 0%,#34A853 40%,#FBBC04 70%,#EA4335 100%)', fg: '#fff',
    scheme: p => `tez://upi/pay?${p}` },
  { id: 'phonepe', name: 'PhonePe', short: 'PhonePe', bg: '#5F259F', fg: '#fff',
    scheme: p => `phonepe://pay?${p}` },
  { id: 'paytm', name: 'Paytm', short: 'Paytm', bg: '#00BAF2', fg: '#fff',
    scheme: p => `paytmmp://pay?${p}` },
  { id: 'bhim', name: 'BHIM', short: 'BHIM', bg: '#00449E', fg: '#fff',
    scheme: p => `bhim://pay?${p}` },
  { id: 'amazonpay', name: 'Amazon Pay', short: 'AmazonPay', bg: '#232F3E', fg: '#FF9900',
    scheme: p => `upi://pay?${p}` },
  { id: 'cred', name: 'CRED', short: 'CRED', bg: '#0F0F0F', fg: '#fff',
    scheme: p => `credpay://upi/pay?${p}` },
];

function AppIcon({ id }: { id: string }) {
  switch (id) {
    case 'gpay':      return <span className="font-bold text-[22px] leading-none">G</span>;
    case 'phonepe':   return <span className="font-bold text-[20px] leading-none">₹</span>;
    case 'paytm':     return <span className="font-bold text-[22px] leading-none italic">P</span>;
    case 'bhim':      return <span className="font-bold text-[14px] leading-none tracking-tight">BHIM</span>;
    case 'amazonpay': return <span className="font-bold text-[13px] leading-none">a</span>;
    case 'cred':      return <span className="font-bold text-[14px] leading-none">CRED</span>;
    default:          return <span>💳</span>;
  }
}

export default function UpiButtons({ amount, note }: { amount: number; note: string }) {
  const params = new URLSearchParams({
    pa: UPI.id, pn: UPI.name, am: String(amount), cu: 'INR', tn: note,
  }).toString();

  const universalUpi = `upi://pay?${params}`;

  const openApp = (app: App) => {
    const link = app.scheme(params);
    window.location.href = link;
    // Fallback to universal UPI if specific app isn't installed
    setTimeout(() => {
      if (!document.hidden) window.location.href = universalUpi;
    }, 1200);
  };

  const openAnyUpi = () => { window.location.href = universalUpi; };

  return (
    <div>
      <button type="button" onClick={openAnyUpi} className="btn-primary rc-glow-btn w-full text-base py-4 cursor-pointer">
        Pay ₹{amount.toLocaleString('en-IN')} — Open UPI App
      </button>
      <p className="text-[11px] text-ivory/60 mt-2 text-center">
        Tapping opens your default UPI app with amount pre-filled.
      </p>
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-ivory/50 text-center mb-3">Or pick your app</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {APPS.map(app => (
            <button key={app.id} type="button" onClick={() => openApp(app)}
              className="flex flex-col items-center gap-2 group active:scale-95 transition cursor-pointer"
              aria-label={`Pay with ${app.name}`}>
              <span className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition"
                style={{ background: app.bg, color: app.fg }}>
                <AppIcon id={app.id} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-ivory/70">{app.short}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}



