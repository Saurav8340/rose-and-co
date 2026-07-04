'use client';

import { useEffect, useState } from 'react';
import { captureVisitor, updateLead, attachUnloadBeacon } from '@/lib/analytics';
import { generateCoupon } from '@/lib/coupon';

export default function LeadCaptureChip() {
  const [stage, setStage] = useState<'hidden' | 'ask' | 'form' | 'done'>('hidden');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coupon, setCoupon] = useState('WELCOME10');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Capture visitor silently + attach unload beacon
    captureVisitor();
    attachUnloadBeacon();

    // Preload from localStorage
    setName(localStorage.getItem('rc_name') || '');
    setEmail(localStorage.getItem('rc_email') || '');
    setPhone(localStorage.getItem('rc_phone') || '');

    if (sessionStorage.getItem('rc_chip_shown')) return;
    if (localStorage.getItem('rc_opted_in')) return;

    const timer = setTimeout(() => {
      setStage('ask');
      sessionStorage.setItem('rc_chip_shown', '1');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleYes = () => {
    updateLead({ optedIn: true });
    setStage('form');
  };

  const handleNo = () => {
    updateLead({ chipDismissed: true, optedIn: false });
    localStorage.setItem('rc_chip_declined', '1');
    setStage('hidden');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;

    const cleanName = name.trim();
    const code = generateCoupon({
      name: cleanName,
      segment: 'real_intent',
      discountPct: 10,
    });

    // Persist locally
    localStorage.setItem('rc_name', cleanName);
    if (email) localStorage.setItem('rc_email', email);
    if (phone) localStorage.setItem('rc_phone', phone);
    localStorage.setItem('rc_active_code', code);
    localStorage.setItem('rc_active_discount', '10');
    localStorage.setItem('rc_opted_in', '1');

    // Send to backend
    updateLead({
      name: cleanName,
      email: email || undefined,
      phone: phone || undefined,
      couponCode: code,
      couponPct: 10,
      segment: 'real_intent',
    });

    setCoupon(code);
    setStage('done');
    setTimeout(() => setStage('hidden'), 5000);
  };

  if (stage === 'hidden') return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 md:left-6 max-w-xs bg-ivory shadow-2xl border border-taupe/20 z-30 overflow-hidden">
      {stage === 'ask' && (
        <div className="p-4 relative">
          <button
            onClick={handleNo}
            aria-label="Dismiss"
            className="absolute top-2 right-2 text-espresso/50 hover:text-espresso text-lg leading-none"
          >×</button>
          <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">A small favour</div>
          <p className="text-sm text-espresso mb-4 leading-relaxed">
            Can we send you a personal 10% off code?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleYes}
              className="flex-1 bg-wine text-ivory py-2 text-xs uppercase tracking-widest hover:bg-espresso transition"
            >
              Yes, please
            </button>
            <button
              onClick={handleNo}
              className="px-4 py-2 text-xs uppercase tracking-widest text-espresso/60 hover:text-espresso"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {stage === 'form' && (
        <form onSubmit={handleSubmit} className="p-4" autoComplete="on">
          <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">One quick moment</div>
          <p className="text-sm text-espresso mb-3">Fill what you like. We autofill the rest.</p>

          <input
            type="text" autoFocus required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="given-name"
            name="given-name"
            className="w-full border border-taupe/30 px-3 py-2 focus:border-wine focus:outline-none text-sm mb-2"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            autoComplete="email"
            name="email"
            className="w-full border border-taupe/30 px-3 py-2 focus:border-wine focus:outline-none text-sm mb-2"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="Phone (optional)"
            autoComplete="tel-national"
            name="tel"
            maxLength={10}
            className="w-full border border-taupe/30 px-3 py-2 focus:border-wine focus:outline-none text-sm mb-3"
          />

          <button
            type="submit"
            disabled={name.trim().length < 2}
            className="w-full bg-wine text-ivory py-2 text-xs uppercase tracking-widest hover:bg-espresso transition disabled:opacity-40"
          >
            Send my code
          </button>
          <p className="text-[10px] text-espresso/50 mt-2 text-center">
            Your browser can autofill these fields.
          </p>
        </form>
      )}

      {stage === 'done' && (
        <div className="p-4 text-center">
          <div className="text-2xl mb-2">🌹</div>
          <p className="text-sm text-espresso mb-1">
            Ready, {name || 'friend'}.
          </p>
          <p className="text-xs text-espresso/70 mb-2">Auto-applied at checkout.</p>
          <div className="font-mono font-semibold text-wine text-lg">{coupon}</div>
        </div>
      )}
    </div>
  );
}
