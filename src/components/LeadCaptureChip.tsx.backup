'use client';

import { useEffect, useState } from 'react';
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

function parseUTM() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get('utm_source') || undefined,
    utmMedium: p.get('utm_medium') || undefined,
    utmCampaign: p.get('utm_campaign') || undefined,
    utmTerm: p.get('utm_term') || undefined,
    utmContent: p.get('utm_content') || undefined,
  };
}

function isAdTraffic(): boolean {
  if (typeof window === 'undefined') return false;
  const utm = parseUTM();
  if (utm.utmSource) return true;
  const refs = ['facebook.com', 'instagram.com', 'l.facebook', 'lm.facebook', 'fb.me', 'ig.me', 't.co', 'lnkd.in', 'google.com/ads'];
  return refs.some(r => document.referrer.includes(r));
}

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const ua = navigator.userAgent;
  if (/iPad|tablet/i.test(ua)) return 'tablet';
  if (/Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
}

export default function LeadCaptureChip() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'ask' | 'form' | 'done'>('ask');
  const [coupon, setCoupon] = useState('WELCOME10');
  const [fromAd, setFromAd] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

    const utm = parseUTM();
    const sessionId = getSessionId();
    const isAd = isAdTraffic();
    setFromAd(isAd);

    // IMMEDIATE silent capture — regardless of modal interaction
    saveLead({
      sessionId,
      landingUrl: window.location.href,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent.slice(0, 500),
      deviceType: getDeviceType(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      visitCount: parseInt(localStorage.getItem('rc_visits') || '0', 10) + 1,
      isReturning: parseInt(localStorage.getItem('rc_visits') || '0', 10) > 0,
      hasAddress: !!localStorage.getItem('rc_address'),
      ...utm,
      timestamp: Date.now(),
    });

    localStorage.setItem('rc_visits', String(parseInt(localStorage.getItem('rc_visits') || '0', 10) + 1));

    fetch('/api/geo', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(geo => {
        if (geo?.city) {
          saveLead({
            sessionId,
            city: geo.city,
            country: geo.country,
            region: geo.region,
            timestamp: Date.now(),
          });
        }
      })
      .catch(() => {});

    if (localStorage.getItem('rc_lead_captured') === '1') return;

    setName(localStorage.getItem('rc_name') || '');
    setEmail(localStorage.getItem('rc_email') || '');
    setPhone(localStorage.getItem('rc_phone') || '');
    setPincode(localStorage.getItem('rc_pincode') || '');
    setCity(localStorage.getItem('rc_city') || '');
    setStateVal(localStorage.getItem('rc_state') || '');
    setAddress(localStorage.getItem('rc_address') || '');

    const delay = isAd ? 3000 : 8000;
    const timer = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      fetch('https://api.postalpincode.in/pincode/' + pincode)
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

  // AUTO-SAVE partial data as user types (fire-and-forget, debounced by field blur)
  const autoSavePartial = () => {
    if (!name.trim() && !phone && !email) return;
    setSaveStatus('saving');
    saveLead({
      sessionId: getSessionId(),
      name: name.trim() || undefined,
      phone: phone || undefined,
      email: email || undefined,
      pincode: pincode || undefined,
      city: city || undefined,
      state: stateVal || undefined,
      addressLine1: address || undefined,
      optedIn: true,
      segment: 'real_intent',
      timestamp: Date.now(),
    });
    // Persist to localStorage on every partial too
    if (name.trim()) localStorage.setItem('rc_name', name.trim());
    if (phone) localStorage.setItem('rc_phone', phone);
    if (email) localStorage.setItem('rc_email', email);
    if (pincode) localStorage.setItem('rc_pincode', pincode);
    if (city) localStorage.setItem('rc_city', city);
    if (stateVal) localStorage.setItem('rc_state', stateVal);
    if (address) localStorage.setItem('rc_address', address);
    setTimeout(() => setSaveStatus('saved'), 300);
  };

  const handleYes = () => {
    setStage('form');
    saveLead({ sessionId: getSessionId(), optedIn: true, timestamp: Date.now() });
  };

  const handleNo = () => {
    // Save that they dismissed but DO NOT mark captured forever
    // They might come back later, and we still respect their choice for this session
    sessionStorage.setItem('rc_chip_dismissed_session', '1');
    saveLead({ sessionId: getSessionId(), chipDismissed: true, timestamp: Date.now() });
    setOpen(false);
  };

  const handleFinalClose = () => {
    // On modal X or backdrop click during FORM stage — save whatever we have + give code
    autoSavePartial();

    // Give code if they gave name (even partial)
    if (name.trim().length >= 2) {
      const code = generateCoupon({
        name: name.trim(),
        segment: 'real_intent',
        discountPct: 10,
      });
      localStorage.setItem('rc_active_code', code);
      localStorage.setItem('rc_active_discount', '10');
      localStorage.setItem('rc_lead_captured', '1');
      saveLead({
        sessionId: getSessionId(),
        name: name.trim(),
        couponCode: code,
        couponPct: 10,
        timestamp: Date.now(),
      });
      setCoupon(code);
      setStage('done');
      setTimeout(() => setOpen(false), 4000);
      return;
    }

    // Nothing given — just close, they can come back
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasName = name.trim().length >= 2;
    const hasPhone = phone.length === 10;

    // FLEXIBLE: allow submit with just name OR just phone OR both
    if (!hasName && !hasPhone) {
      setSaveStatus('idle');
      return;
    }

    const cleanName = name.trim() || 'friend';
    const code = generateCoupon({
      name: hasName ? cleanName : undefined,
      segment: 'real_intent',
      discountPct: 10,
    });

    if (hasName) localStorage.setItem('rc_name', cleanName);
    if (hasPhone) localStorage.setItem('rc_phone', phone);
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
      name: hasName ? cleanName : undefined,
      phone: hasPhone ? phone : undefined,
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('rc_identity_updated'));
    }

    setCoupon(code);
    setStage('done');
    setTimeout(() => setOpen(false), 4000);
  };

  if (!mounted || !open) return null;

  const askHeading = fromAd ? 'Welcome from the ad. 10% off?' : '10% off your first set?';
  const askSub = fromAd
    ? 'Just a name gets you the code. Fill more if you want faster checkout.'
    : 'Just a name gets the code. Rest is optional but saves time later.';

  const canSubmit = name.trim().length >= 2 || phone.length === 10;

  const modal = (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={stage === 'ask' ? handleNo : handleFinalClose}
      />
      <div className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm md:w-full bg-ivory shadow-2xl border border-taupe/20 z-50 overflow-hidden">
        {stage === 'ask' && (
          <div className="p-6 relative">
            <button
              onClick={handleNo}
              aria-label="Dismiss"
              className="absolute top-3 right-3 text-espresso/50 hover:text-espresso text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >×</button>
            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2">
              {fromAd ? 'Thanks for tapping' : 'A small welcome'}
            </div>
            <h3 className="font-display text-2xl text-espresso mb-3">{askHeading}</h3>
            <p className="text-sm text-espresso/70 mb-6 leading-relaxed">{askSub}</p>
            <div className="flex gap-2">
              <button
                onClick={handleYes}
                className="flex-1 bg-wine text-ivory py-3 uppercase tracking-widest text-sm font-medium hover:bg-espresso transition"
              >
                Yes, send code
              </button>
              <button
                onClick={handleNo}
                className="px-4 py-3 text-xs uppercase tracking-widest text-espresso/60 hover:text-espresso"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {stage === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 relative" autoComplete="on">
            {/* Close button - always available */}
            <button
              type="button"
              onClick={handleFinalClose}
              aria-label="Close"
              className="absolute top-3 right-3 text-espresso/50 hover:text-espresso text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >×</button>

            <div className="text-xs uppercase tracking-[0.3em] text-wine mb-2 pr-8">Quick moment</div>
            <p className="text-sm text-espresso/70 mb-4 leading-relaxed pr-8">
              Just <strong>name OR phone</strong> gets you the code. Fill more for 1-tap checkout later.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={autoSavePartial}
                  placeholder="Full name"
                  autoComplete="name"
                  name="name"
                  className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm"
                />
                {name.trim().length >= 2 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm">✓</span>
                )}
              </div>

              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={autoSavePartial}
                  placeholder="Phone (optional but recommended)"
                  autoComplete="tel-national"
                  name="tel"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm"
                />
                {phone.length === 10 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm">✓</span>
                )}
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={autoSavePartial}
                placeholder="Email (optional)"
                autoComplete="email"
                name="email"
                className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onBlur={autoSavePartial}
                  placeholder="PIN"
                  autoComplete="postal-code"
                  name="postal-code"
                  maxLength={6}
                  inputMode="numeric"
                  className="col-span-1 border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={autoSavePartial}
                  placeholder="City (auto)"
                  autoComplete="address-level2"
                  name="city"
                  className="col-span-2 border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm"
                />
              </div>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={autoSavePartial}
                placeholder="Street address (optional)"
                autoComplete="street-address"
                name="street-address"
                className="w-full border border-taupe/30 px-3 py-2.5 focus:border-wine focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 w-full bg-wine text-ivory py-3 uppercase tracking-widest text-sm font-medium hover:bg-espresso transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canSubmit ? 'Get my code' : 'Enter name or phone to continue'}
            </button>

            {saveStatus === 'saving' && (
              <p className="text-[10px] text-espresso/50 mt-2 text-center">Saving...</p>
            )}
            {saveStatus === 'saved' && (
              <p className="text-[10px] text-green-700 mt-2 text-center">✓ Progress saved</p>
            )}
            {saveStatus === 'idle' && (
              <p className="text-[10px] text-espresso/50 mt-2 text-center">
                We save as you type. Close anytime — no data lost.
              </p>
            )}
          </form>
        )}

        {stage === 'done' && (
          <div className="p-8 text-center">
            <div className="text-3xl mb-3">🌹</div>
            <h3 className="font-display text-2xl text-espresso mb-2">
              Ready, {name || 'friend'}.
            </h3>
            <p className="text-sm text-espresso/70 mb-4">
              Auto-applied at checkout.
            </p>
            <div className="font-mono font-semibold text-wine text-xl bg-blush/40 py-3 px-4 inline-block">
              {coupon}
            </div>
            {(!phone || phone.length < 10) && (
              <p className="text-xs text-espresso/60 mt-4 leading-relaxed">
                Add your phone at checkout for WhatsApp order updates.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
