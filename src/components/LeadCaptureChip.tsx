'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { generateCoupon } from '@/lib/coupon';

async function saveLead(data: Record<string, any>) {
  try {
    await fetch('/api/leads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch {}
}

function getSessionId(): string {
  let id = sessionStorage.getItem('rc_session_id');
  if (!id) {
    id = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    sessionStorage.setItem('rc_session_id', id);
  }
  return id;
}

export default function LeadCaptureChip() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'ask' | 'form' | 'done'>('ask');
  const [coupon, setCoupon] = useState('WELCOME10');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    if (localStorage.getItem('rc_lead_captured') === '1') return;

    setName(localStorage.getItem('rc_name') || '');
    setEmail(localStorage.getItem('rc_email') || '');
    setPhone(localStorage.getItem('rc_phone') || '');

    // Delay to 8 seconds - after LCP + first meaningful interaction
    // Uses requestIdleCallback for non-blocking scheduling
    const schedule = (cb: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(cb, { timeout: 8000 });
      } else {
        setTimeout(cb, 8000);
      }
    };

    schedule(() => setOpen(true));
  }, []);

  useEffect(() => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(r => r.json())
        .then(data => {
          if (data[0]?.Status === 'Success' && data[0].PostOffice?.[0]) {
            const p = data[0].PostOffice[0];
            setCity(p.District || p.Block || '');
            setStateVal(p.State || '');
          }
        })
        .catch(() => {});
    }
  }, [pincode]);

  const handleYes = () => {
    setStage('form');
    saveLead({ sessionId: getSessionId(), optedIn: true, timestamp: Date.now() });
  };

  const handleNo = () => {
    localStorage.setItem('rc_lead_captured', '1');
    saveLead({ sessionId: getSessionId(), chipDismissed: true, timestamp: Date.now() });
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || phone.length !== 10) return;

    const cleanName = name.trim();
    const code = generateCoupon({ name: cleanName, segment: 'real_intent', discountPct: 10 });

    localStorage.setItem('rc_name', cleanName);
    localStorage.setItem('rc_phone', phone);
    if (email) localStorage.setItem('rc_email', email);
    if (pincode) localStorage.setItem('rc_pincode', pincode);
    if (city) localStorage.setItem('rc_city', city);
    if (stateVal) localStorage.setItem('rc_state', stateVal);
    if (address) localStorage.setItem('rc_address', address);
    localStorage.setItem('rc_active_code', code);
    localStorage.setItem('rc_active_discount', '10');
    localStorage.setItem('rc_lead_captured', '1');

    await saveLead({
      sessionId: getSessionId(),
      name: cleanName,
      phone,
      email: email || undefined,
      pincode: pincode || undefined,
      city: city || undefined,
      state: stateVal || undefined,
      addressLine1: address || undefined,
      couponCode: code,
      couponPct: 10,
      segment: 'real_intent',
      optedIn: true,
      timestamp: Date.now(),
    });

    setCoupon(code);
    setStage('done');
    setTimeout(() => setOpen(false), 4000);
  };

  if (!mounted || !open) return null;

  const modal = (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={stage === 'ask' ? handleNo : undefined}
        style={{ willChange: 'auto' }}
      />
      <div
        className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm md:w-full bg-ivory shadow-2xl border border-taupe/20 z-50 overflow-hidden"
        style={{ willChange: 'transform', contain: 'layout paint' }}
      >
        {stage === 'ask' && (
          <div className="p-6 relative">
            <button onClick={handleNo} aria-label="Dismiss" className="absolute top-3 right-3 text-espresso/50 hover:text-espresso text-2xl leading-none">×</button>
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">A small welcome</div>
            <h3 className="font-display text-2xl text-espresso mb-3">10% off your first set?</h3>
            <p className="text-sm text-espresso/70 mb-6 leading-relaxed">Your browser will fill everything. One tap, code is yours.</p>
            <div className="flex gap-2">
              <button onClick={handleYes} className="flex-1 bg-wine text-ivory py-3 uppercase tracking-widest text-sm font-medium hover:bg-espresso transition">Yes, send code</button>
              <button onClick={handleNo} className="px-4 py-3 text-xs uppercase tracking-widest text-espresso/60 hover:text-espresso">No</button>
            </div>
          </div>
        )}

        {stage === 'form' && (
          <form onSubmit={handleSubmit} className="p-6" autoComplete="on">
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">One quick moment</div>
            <p className="text-sm text-espresso/70 mb-4 leading-relaxed">Tap any field. Your browser fills the rest.</p>
            <div className="space-y-2">
              <input type="text" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" name="name" className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm" />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone (10 digits)" autoComplete="tel-national" name="tel" maxLength={10} inputMode="numeric" className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" name="email" className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="PIN" autoComplete="postal-code" name="postal-code" maxLength={6} inputMode="numeric" className="col-span-1 border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm" />
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" autoComplete="address-level2" name="city" className="col-span-2 border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm" />
              </div>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" autoComplete="street-address" name="street-address" className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm" />
            </div>
            <button type="submit" disabled={name.trim().length < 2 || phone.length !== 10} className="mt-4 w-full bg-wine text-ivory py-3 uppercase tracking-widest text-sm font-medium hover:bg-espresso transition disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
            <p className="text-[10px] text-espresso/50 mt-2 text-center">We save this once. You never see this again.</p>
          </form>
        )}

        {stage === 'done' && (
          <div className="p-8 text-center">
            <div className="text-3xl mb-3">🌹</div>
            <h3 className="font-display text-2xl text-espresso mb-2">Ready, {name || 'friend'}.</h3>
            <p className="text-sm text-espresso/70 mb-4">Auto-applied at checkout.</p>
            <div className="font-mono font-semibold text-wine text-xl bg-blush/40 py-3 px-4 inline-block">{coupon}</div>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
