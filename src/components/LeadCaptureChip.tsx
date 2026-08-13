'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { generateCoupon } from '@/lib/coupon';
import { getSessionId, readIdentity, writeIdentity } from '@/lib/identity';
import { requestContactShare, isContactPickerSupported } from '@/lib/autofill';

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

// FIX: getSessionId() used to be defined locally here using sessionStorage,
// which resets every time the browser tab closes. Now imported from
// lib/identity.ts, which uses localStorage — so the same visitor keeps
// updating one Lead record across visits instead of creating a new
// fragmented one every session. See identity.ts for the full explanation.

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
  const [contactPickerSupported, setContactPickerSupported] = useState(false);

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

    setContactPickerSupported(isContactPickerSupported());

    const utm = parseUTM();
    const sessionId = getSessionId();
    const isAd = isAdTraffic();
    setFromAd(isAd);

    // Read whatever we already know about this visitor FIRST, so the
    // "hasAddress" flag below is accurate.
    const identity = readIdentity();

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
      hasAddress: !!identity.address,
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

    setName(identity.name || '');
    setEmail(identity.email || '');
    setPhone(identity.phone || '');
    setPincode(identity.pincode || '');
    setCity(identity.city || '');
    setStateVal(identity.state || '');
    setAddress(identity.address || '');

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
    // FIX: was several individual localStorage.setItem calls using its own
    // key names — now a single writeIdentity() call so this data lands in
    // the exact same store checkout/page.tsx now reads from.
    writeIdentity({
      name: name.trim() || undefined,
      phone: phone || undefined,
      email: email || undefined,
      pincode: pincode || undefined,
      city: city || undefined,
      state: stateVal || undefined,
      address: address || undefined,
    });
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

  // NEW: actually wires up the Contact Picker API that lib/autofill.ts
  // exports (previously written but never imported anywhere in the app).
  // Only shown on supported browsers (Android Chrome). Must run directly
  // from this click handler — the browser rejects it if called any other
  // way (e.g. inside a useEffect or a delayed callback).
  const handleUseDeviceContact = async () => {
    const shared = await requestContactShare();
    if (!shared) return;
    if (shared.name) setName(shared.name);
    if (shared.email) setEmail(shared.email);
    if (shared.phone) setPhone(shared.phone);
    writeIdentity({
      name: shared.name,
      email: shared.email,
      phone: shared.phone,
    });
    saveLead({
      sessionId: getSessionId(),
      name: shared.name,
      email: shared.email,
      phone: shared.phone,
      timestamp: Date.now(),
    });
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

    writeIdentity({
      name: hasName ? cleanName : undefined,
      phone: hasPhone ? phone : undefined,
      email: email || undefined,
      pincode: pincode || undefined,
      city: city || undefined,
      state: stateVal || undefined,
      address: address || undefined,
    });
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

  const askHeading = fromAd ? 'Welcome from the ad. 10% off?' : '10% off your first piece?';
  const askSub = fromAd
    ? 'Just a name gets you the code. Fill more if you want faster checkout.'
    : 'Just a name gets the code. Rest is optional but saves time later.';

  const canSubmit = name.trim().length >= 2 || phone.length === 10;

  const modal = (
    <>
      <div
        className="fixed inset-0 bg-espresso/70 z-40 backdrop-blur-sm"
        onClick={stage === 'ask' ? handleNo : handleFinalClose}
      />
      <div className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm md:w-full bg-blush shadow-2xl border border-taupe/30 rounded-lg z-50 overflow-hidden">
        {stage === 'ask' && (
          <div className="p-6 relative">
            <button
              onClick={handleNo}
              aria-label="Dismiss"
              className="absolute top-3 right-3 text-ivory/50 hover:text-ivory text-2xl leading-none w-8 h-8 flex items-center justify-center cursor-pointer"
            >×</button>
            <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-2">
              {fromAd ? 'Thanks for tapping' : 'A small welcome'}
            </div>
            <h3 className="font-display text-2xl text-ivory mb-3">{askHeading}</h3>
            <p className="text-sm text-ivory/70 mb-6 leading-relaxed">{askSub}</p>
            <div className="flex gap-2">
              <button
                onClick={handleYes}
                className="flex-1 bg-wine text-ivory py-3 uppercase tracking-widest text-sm font-medium hover:bg-wine/90 rc-glow-btn transition cursor-pointer rounded"
              >
                Yes, send code
              </button>
              <button
                onClick={handleNo}
                className="px-4 py-3 text-xs uppercase tracking-widest text-ivory/60 hover:text-ivory transition cursor-pointer"
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
              className="absolute top-3 right-3 text-ivory/50 hover:text-ivory text-2xl leading-none w-8 h-8 flex items-center justify-center cursor-pointer"
            >×</button>

            <div className="text-xs uppercase tracking-[0.3em] text-crimson mb-2 pr-8">Quick moment</div>
            <p className="text-sm text-ivory/70 mb-4 leading-relaxed pr-8">
              Just <strong className="text-ivory">name OR phone</strong> gets you the code. Fill more for 1-tap checkout later.
            </p>

            {contactPickerSupported && (
              <button
                type="button"
                onClick={handleUseDeviceContact}
                className="w-full mb-3 border border-wine/50 text-crimson py-2.5 text-xs uppercase tracking-widest rounded hover:bg-wine/10 transition cursor-pointer"
              >
                Use my device contact
              </button>
            )}

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
                  className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2.5 focus:border-wine focus:outline-none text-sm rounded"
                />
                {name.trim().length >= 2 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-crimson text-sm">✓</span>
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
                  className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2.5 focus:border-wine focus:outline-none text-sm rounded"
                />
                {phone.length === 10 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-crimson text-sm">✓</span>
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
                className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2.5 focus:border-wine focus:outline-none text-sm rounded"
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
                  className="col-span-1 border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2.5 focus:border-wine focus:outline-none text-sm rounded"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={autoSavePartial}
                  placeholder="City (auto)"
                  autoComplete="address-level2"
                  name="city"
                  className="col-span-2 border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2.5 focus:border-wine focus:outline-none text-sm rounded"
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
                className="w-full border border-taupe/40 bg-blush/60 text-ivory placeholder:text-ivory/40 px-3 py-2.5 focus:border-wine focus:outline-none text-sm rounded"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 w-full bg-wine text-ivory py-3 uppercase tracking-widest text-sm font-medium hover:bg-wine/90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded"
            >
              {canSubmit ? 'Get my code' : 'Enter name or phone to continue'}
            </button>

            {saveStatus === 'saving' && (
              <p className="text-[10px] text-ivory/50 mt-2 text-center">Saving...</p>
            )}
            {saveStatus === 'saved' && (
              <p className="text-[10px] text-crimson mt-2 text-center">✓ Progress saved</p>
            )}
            {saveStatus === 'idle' && (
              <p className="text-[10px] text-ivory/50 mt-2 text-center">
                We save as you type. Close anytime — no data lost.
              </p>
            )}
          </form>
        )}

        {stage === 'done' && (
          <div className="p-8 text-center">
            <div className="text-3xl mb-3">🖤</div>
            <h3 className="font-display text-2xl text-ivory mb-2">
              Ready, {name || 'friend'}.
            </h3>
            <p className="text-sm text-ivory/70 mb-4">
              Save it for your next order.
            </p>
            <div className="font-mono font-semibold text-crimson text-xl bg-blush/60 py-3 px-4 inline-block rounded">
              {coupon}
            </div>
            {(!phone || phone.length < 10) && (
              <p className="text-xs text-ivory/60 mt-4 leading-relaxed">
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




