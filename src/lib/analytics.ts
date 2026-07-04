// src/lib/analytics.ts
// Auto-captures visitor context, sends to /api/leads/create

interface VisitorContext {
  sessionId: string;
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  city?: string;
  country?: string;
  region?: string;
  name?: string;
  phone?: string;
  email?: string;
  visitCount: number;
  isReturning: boolean;
  savedAddress: boolean;
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
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
}

export async function captureVisitor(): Promise<VisitorContext> {
  const geoRes = await fetch('/api/geo', { cache: 'no-store' }).catch(() => null);
  const geo = geoRes && geoRes.ok ? await geoRes.json() : {};

  const ctx: VisitorContext = {
    sessionId: getSessionId(),
    timestamp: Date.now(),
    url: window.location.href,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utm: parseUTM(),
    city: geo.city,
    country: geo.country,
    region: geo.region,
    name: localStorage.getItem('rc_name') || undefined,
    phone: localStorage.getItem('rc_phone') || undefined,
    email: localStorage.getItem('rc_email') || undefined,
    visitCount: parseInt(localStorage.getItem('rc_visits') || '1', 10),
    isReturning: parseInt(localStorage.getItem('rc_visits') || '1', 10) > 1,
    savedAddress: !!localStorage.getItem('rc_last_address'),
  };

  fetch('/api/leads/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx),
    keepalive: true,
  }).catch(() => {});

  return ctx;
}

export function updateLead(patch: Partial<VisitorContext>) {
  const sessionId = getSessionId();
  fetch('/api/leads/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, ...patch, timestamp: Date.now() }),
    keepalive: true,
  }).catch(() => {});
}
