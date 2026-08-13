// src/lib/autofill.ts
// Uses Web Credential Management API + native browser autofill
// Zero user friction — fills name, phone, email, city automatically
//
// RESTORED at user's request on 2026-08-13: an earlier pass had removed
// persistIdentity()'s PasswordCredential storage and tryAutoFillCredential()
// as a flagged concern (writing an auto-generated, non-user-chosen password
// into the browser's real password manager under the customer's email,
// without an explicit visible prompt). User asked for this file restored
// exactly as it originally was, so nothing below is altered from the
// original version. Flagging again here only for the record: if this
// behavior is ever revisited, consider a visible opt-in checkbox (e.g.
// "save my details for faster checkout next time") before
// navigator.credentials.store() runs.

/**
 * Try native Credential Management API (Chrome, Edge on mobile).
 * If browser has saved autofill data, offers it silently.
 */
export async function tryAutoFillCredential(): Promise<{
  name?: string;
  email?: string;
  phone?: string;
} | null> {
  if (typeof window === 'undefined') return null;
  if (!('credentials' in navigator)) return null;

  try {
    // @ts-ignore — federated is experimental
    const cred = await navigator.credentials.get({
      mediation: 'silent',
      identity: { providers: [] },
    } as any);
    if (cred && (cred as any).name) {
      return {
        name: (cred as any).name,
        email: (cred as any).email,
      };
    }
  } catch {}
  return null;
}

/**
 * Standard autoComplete attribute map — this is the KEY to browser autofill
 * When you set these attributes correctly, Chrome/Safari/Edge auto-populate
 * from user's saved contact card / Google Wallet / Apple Keychain
 */
export const AUTOFILL_ATTRS = {
  name: 'name',
  firstName: 'given-name',
  lastName: 'family-name',
  email: 'email',
  phone: 'tel',
  phoneNational: 'tel-national',
  streetAddress: 'street-address',
  addressLine1: 'address-line1',
  addressLine2: 'address-line2',
  city: 'address-level2',
  state: 'address-level1',
  postalCode: 'postal-code',
  country: 'country',
  ccNumber: 'cc-number',
  ccName: 'cc-name',
  ccExp: 'cc-exp',
  ccCvc: 'cc-csc',
  organization: 'organization',
} as const;

export function isContactPickerSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore — experimental API, Android Chrome only
  return !!(navigator as any).contacts?.select;
}

/**
 * Fire a native autofill request. Some browsers offer a "share contact info"
 * prompt via the Contact Picker API (mobile Chrome).
 */
export async function requestContactShare(): Promise<{
  name?: string;
  email?: string;
  phone?: string;
} | null> {
  if (typeof window === 'undefined') return null;
  // @ts-ignore
  const picker = (navigator as any).contacts;
  if (!picker || !picker.select) return null;

  try {
    const props = ['name', 'email', 'tel'];
    const opts = { multiple: false };
    const contacts = await picker.select(props, opts);
    if (contacts && contacts[0]) {
      const c = contacts[0];
      return {
        name: c.name?.[0],
        email: c.email?.[0],
        phone: c.tel?.[0],
      };
    }
  } catch {}
  return null;
}

/**
 * Save details to localStorage AND browser Credential storage so
 * future visits are 100% auto-filled.
 */
export async function persistIdentity(data: {
  name?: string;
  email?: string;
  phone?: string;
}) {
  if (data.name) localStorage.setItem('rc_name', data.name);
  if (data.email) localStorage.setItem('rc_email', data.email);
  if (data.phone) localStorage.setItem('rc_phone', data.phone);

  // Try to save to Password Manager / Keychain via Credentials API
  if ('credentials' in navigator && data.email) {
    try {
      // @ts-ignore
      const cred = new (window as any).PasswordCredential({
        id: data.email,
        name: data.name || data.email,
        password: 'rc-session-' + Date.now().toString(36),
      });
      // @ts-ignore
      await navigator.credentials.store(cred);
    } catch {}
  }
}

/**
 * Read from localStorage first, then try native autofill on empty fields.
 */
export async function bootstrapIdentity(): Promise<{
  name?: string;
  email?: string;
  phone?: string;
  fromAutofill: boolean;
}> {
  const name = localStorage.getItem('rc_name') || undefined;
  const email = localStorage.getItem('rc_email') || undefined;
  const phone = localStorage.getItem('rc_phone') || undefined;

  if (name && email && phone) {
    return { name, email, phone, fromAutofill: false };
  }

  const cred = await tryAutoFillCredential();
  if (cred) {
    if (cred.name && !name) localStorage.setItem('rc_name', cred.name);
    if (cred.email && !email) localStorage.setItem('rc_email', cred.email);
    return {
      name: cred.name || name,
      email: cred.email || email,
      phone,
      fromAutofill: true,
    };
  }

  return { name, email, phone, fromAutofill: false };
}



