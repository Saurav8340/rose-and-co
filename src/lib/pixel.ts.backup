'use client';
declare global { interface Window { fbq: any; _fbq: any; } }

// Zero client-side funnel events. Purchase fires server-side via CAPI
// only when money is in the bank.

export function pageview() {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'PageView');
}
export function track(_event: string, _data?: Record<string, any>, _eventId?: string) {}
export function generateEventId() { return ''; }
