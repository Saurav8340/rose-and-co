// First-touch UTM tracking. Captures on landing, kept in localStorage.
// Sent to Meta CAPI so you can attribute paid orders back to campaigns.

const KEY = 'rc_utm_v1';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

export type UtmData = Record<string, string>;

export function captureUtm(): UtmData {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const captured: UtmData = {};
  for (const key of PARAMS) {
    const v = url.searchParams.get(key);
    if (v) captured[key] = v.slice(0, 200);
  }
  const existing = readUtm();
  if (Object.keys(existing).length === 0 && Object.keys(captured).length > 0) {
    localStorage.setItem(KEY, JSON.stringify({ ...captured, ts: String(Date.now()) }));
    return captured;
  }
  return existing;
}

export function readUtm(): UtmData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

export function serializedUtm(): string {
  const d = readUtm();
  if (Object.keys(d).length === 0) return '';
  return JSON.stringify(d);
}



