'use client';

import { useEffect, useState } from 'react';
import { captureVisitor, updateLead } from '@/lib/analytics';
import { generateCoupon } from '@/lib/coupon';
import { bootstrapIdentity, persistIdentity, requestContactShare } from '@/lib/autofill';

export default function LeadCaptureChip() {
  const [stage, setStage] = useState<'hidden' | 'ask' | 'confirm' | 'name' | 'done'>('hidden');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coupon, setCoupon] = useState('WELCOME10');
  const [isPreFilled, setIsPreFilled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    captureVisitor();

    if (sessionStorage.getItem('rc_chip_shown')) return;
    if (localStorage.getItem('rc_opted_in')) return;

    // Bootstrap identity — try native autofill silently
    bootstrapIdentity().then((data) => {
      if (data.name) setName(data.name);
      if (data.email) setEmail(data.email);
      if (data.phone) setPhone(data.phone);
      if (data.name && data.email) setIsPreFilled(true);
    });

    const timer = setTimeout(() => {
      setStage('ask');
      sessionStorage.setItem('rc_chip_shown', '1');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const generateAndSaveCode = (userName?: string) => {
    const code = generateCoupon({
      name: userName,
      segment: 'real_intent',
      discountPct: 10,
    });
    setCoupon(code);
    localStorage.setItem('rc_active_code', code);
    localStorage.setItem('rc_active_discount', '10');
    return code;
  };

  const handleYes = async () => {
    updateLead({ optedIn: true } as any);

    // If we already have data via autofill, skip to confirmation
    if (isPreFilled) {
      const code = generateAndSaveCode(name);
      await persistIdentity({ name, email, phone });
      updateLead({ name, email, phone, couponCode: code, couponPct: 10 } as any);
      setStage('done');
      setTimeout(() => setStage('hidden'), 5000);
      return;
    }

    // Try Contact Picker API (mobile Chrome)
    const contact = await requestContactShare();
    if (contact) {
      if (contact.name) setName(contact.name);
      if (contact.email) setEmail(contact.email);
      if (contact.phone) setPhone(contact.phone);
      const code = generateAndSaveCode(contact.name);
      await persistIdentity(contact);
      updateLead({ ...contact, couponCode: code, couponPct: 10 } as any);
      setStage('done');
      setTimeout(() => setStage('hidden'), 5000);
      return;
    }

    setStage('name');
  };

  const handleNo = () => {
    setStage('hidden');
    updateLead({ optedIn: false } as any);
    localStorage.setItem('rc_chip_declined', '1');
  };

  const handleConfirm = async () => {
    const code = generateAndSaveCode(name);
    await persistIdentity({ name, email, phone });
    updateLead({ name, email, phone, couponCode: code, couponPct: 10 } as any);
    localStorage.setItem('rc_opted_in', '1');
    setStage('done');
    setTimeout(() => setStage('hidden'), 5000);
  };

  const handleNameSubmit = async () => {
    if (name.trim().length < 2) return;
    const code = generateAndSaveCode(name.trim());
    await persistIdentity({ name: name.trim(), email, phone });
    updateLead({
      name: name.trim(), email, phone,
      couponCode: code, couponPct: 10,
    } as any);
    localStorage.setItem('rc_opted_in', '1');
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
          <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">Small favour</div>
          <p className="text-sm text-espresso mb-4 leading-relaxed">
            {isPreFilled && name
              ? `${name}, want your personal 10% off code?`
              : 'Can we send you a personal 10% off code?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleYes}
              className="flex-1 bg-wine text-ivory py-2 text-xs uppercase tracking-widest hover:bg-espresso transition"
            >
              Yes
            </button>
            <button
              onClick={handleNo}
              className="px-4 py-2 text-xs uppercase tracking-widest text-espresso/60 hover:text-espresso"
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {stage === 'name' && (
        <div className="p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">One thing</div>
          <p className="text-sm text-espresso mb-3">What should we call you?</p>
          <form onSubmit={(e) => { e.preventDefault(); handleNameSubmit(); }}>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
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
              className="w-full border border-taupe/30 px-3 py-2 focus:border-wine focus:outline-none text-sm mb-2"
            />
            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="w-full bg-wine text-ivory py-2 text-xs uppercase tracking-widest hover:bg-espresso transition disabled:opacity-40"
            >
              Get my code
            </button>
          </form>
          <p className="text-[10px] text-espresso/50 mt-2 text-center">
            Your browser can autofill these. We never share your data.
          </p>
        </div>
      )}

      {stage === 'done' && (
        <div className="p-4 text-center">
          <div className="text-2xl mb-2">🌹</div>
          <p className="text-sm text-espresso mb-1">
            {name ? `Ready, ${name}.` : 'Ready.'}
          </p>
          <p className="text-xs text-espresso/70 mb-2">Your code is auto-applied at checkout.</p>
          <div className="font-mono font-semibold text-wine text-lg">{coupon}</div>
        </div>
      )}
    </div>
  );
}
