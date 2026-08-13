// src/lib/identity.ts
// Single source of truth for "who is this visitor" — name, phone, email,
// address fields, and a persistent lead/session ID.
//
// FIX: this data used to be read/written directly via scattered
// localStorage.getItem/setItem calls duplicated across LeadCaptureChip.tsx,
// NameCollector.tsx, and checkout/page.tsx. Checkout never read the keys
// the lead popup wrote to at all (it only read a separate 'rc_checkout'
// key), so a customer who already gave their name/phone/pincode to the
// 10%-off popup had to type all of it again from scratch at checkout.
// Every component should now import readIdentity/writeIdentity from here
// instead of touching localStorage directly, so there is exactly one
// place data is stored and exactly one shape it's stored in.

export type Identity = {
  name?: string;
  email?: string;
  phone?: string;
  pincode?: string;
  city?: string;
  state?: string;
  address?: string;
};

const KEYS: Record<keyof Identity, string> = {
  name: 'rc_name',
  email: 'rc_email',
  phone: 'rc_phone',
  pincode: 'rc_pincode',
  city: 'rc_city',
  state: 'rc_state',
  address: 'rc_address',
};

// Reads every stored identity field. Missing fields are simply omitted
// from the returned object (never returns empty strings).
export function readIdentity(): Identity {
  if (typeof window === 'undefined') return {};
  const out: Identity = {};
  (Object.keys(KEYS) as (keyof Identity)[]).forEach((k) => {
    const v = localStorage.getItem(KEYS[k]);
    if (v) out[k] = v;
  });
  return out;
}

// Writes only the fields passed in. Blank/undefined values are ignored,
// so calling writeIdentity({ name: '' }) will NOT wipe a previously saved
// name — pass fresh non-empty values only.
export function writeIdentity(partial: Identity) {
  if (typeof window === 'undefined') return;
  (Object.keys(partial) as (keyof Identity)[]).forEach((k) => {
    const v = partial[k];
    if (v && v.trim()) localStorage.setItem(KEYS[k], v.trim());
  });
}

const SESSION_KEY = 'rc_session_id';

// FIX: this ID used to live in sessionStorage, which is cleared every time
// the browser tab/window closes. Since the Lead database record is looked
// up by this exact ID (prisma.lead.upsert({ where: { sessionId } })), every
// new browser session created a brand-new, disconnected Lead row for what
// was actually the same returning visitor — fragmenting one real customer
// into multiple partial leads in /admin/leads. Moved to localStorage so
// the same visitor keeps updating ONE Lead record across visits, matching
// the visitCount/isReturning fields your schema already tracks for exactly
// this purpose.
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}



