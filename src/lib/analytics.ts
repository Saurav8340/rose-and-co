// src/lib/analytics.ts
// Captures maximum visitor data and syncs to /api/leads/create

interface VisitorPatch {
  sessionId?: string;
  timestamp?: number;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  language?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  screenWidth?: number;
  screenHeight?: number;
  userAgent?: string;
  landingUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  visitCount?: number;
  isReturning?: boolean;
  hasAddress?: boolean;
  timeOnSite?: number;
  pagesViewed?: number;
  scrolled?: boolean;
  optedIn?: boolean;
  chipDismissed?: boolean;
  couponCode?: string;
  couponPct?: number;
  segment?: string;
  cartAdded?: boolean;
  cartValue?: number;
  cartSummary?: string;
  cartAbandoned?: boolean;
  orderNumber?: string;
  converted?: boolean;
}

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const ua = navigator.userAgent;
  if (/iPad|tablet/i.test(ua)) return 'tablet';
  if (/Android|iPhone|iPod/i.test(ua)) return 'mobile';
  return 'desktop';
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
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get('utm_source') || undefined,
    utmMedium: p.get('utm_medium') || undefined,
    utmCampaign: p.get('utm_campaign') || undefined,
    utmTerm: p.get('utm_term') || undefined,
    utmContent: p.get('utm_content') || undefined,
  };
}

async function fetchGeo(): Promise<{ city?: string; country?: string; region?: string }> {
  try {
    const res = await fetch('/api/geo', { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Called once on landing — captures full visitor context.
 */
export async function captureVisitor(): Promise<void> {
  if (typeof window === 'undefined') return;

  const geo = await fetchGeo();
  const visitCount = parseInt(localStorage.getItem('rc_visits') || '0', 10) + 1;
  localStorage.setItem('rc_visits', String(visitCount));

  const patch: VisitorPatch = {
    sessionId: getSessionId(),
    timestamp: Date.now(),
    landingUrl: window.location.href,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent.slice(0, 500),
    deviceType: getDeviceType(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    city: geo.city,
    country: geo.country,
    region: geo.region,
    name: localStorage.getItem('rc_name') || undefined,
    phone: localStorage.getItem('rc_phone') || undefined,
    email: localStorage.getItem('rc_email') || undefined,
    visitCount,
    isReturning: visitCount > 1,
    hasAddress: !!localStorage.getItem('rc_last_address'),
    pagesViewed: 1,
    ...parseUTM(),
  };

  await sendPatch(patch);
}

/**
 * Partial update — for any new signal (name entered, cart added, etc.)
 */
export async function updateLead(patch: VisitorPatch): Promise<void> {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  await sendPatch({ sessionId, timestamp: Date.now(), ...patch });
}

async function sendPatch(patch: VisitorPatch): Promise<void> {
  try {
    await fetch('/api/leads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
      keepalive: true,
    });
  } catch {
    // silent — do not block user
  }
}

/**
 * Attach page unload beacon so we capture cart-abandonment even if user closes tab.
 */
export function attachUnloadBeacon(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeunload', () => {
    const sessionId = sessionStorage.getItem('rc_session_id');
    if (!sessionId) return;
    const cartRaw = localStorage.getItem('rc_cart_v1');
    if (!cartRaw) return;
    try {
      const cart = JSON.parse(cartRaw);
      if (!Array.isArray(cart) || cart.length === 0) return;
      const cartValue = cart.reduce((s: number, x: any) => s + (x.price || 0) * (x.quantity || 1), 0);
      const cartSummary = cart.map((x: any) => `${x.name} (${x.size})`).join(', ').slice(0, 500);
      navigator.sendBeacon(
        '/api/leads/create',
        new Blob([JSON.stringify({
          sessionId, cartAbandoned: true, cartValue, cartSummary, timestamp: Date.now(),
        })], { type: 'application/json' })
      );
    } catch {}
  });
}



