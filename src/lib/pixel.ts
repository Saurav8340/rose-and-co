'use client';

declare global {
  interface Window { fbq: any; _fbq: any; }
}

export function pageview() {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'PageView');
}

// Now functional. Call this from components to fire mid-funnel events, e.g.:
//   track('ViewContent', { content_ids: [id], value, currency: 'INR' })
//   track('AddToCart',   { content_ids: [id], value, currency: 'INR' })
//   track('InitiateCheckout', { value, currency: 'INR' })
export function track(event: string, data?: Record<string, any>, eventId?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  const opts = eventId ? { eventID: eventId } : undefined;
  window.fbq('track', event, data || {}, opts);
}

export function generateEventId() {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}



