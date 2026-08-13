import crypto from 'crypto';

const PIXEL_ID     = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_CODE    = process.env.META_TEST_EVENT_CODE;

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

export type CapiOrder = {
  orderNumber: string;
  paidAmount: number;
  email?: string | null;
  mobile: string;
  fullName: string;
  city: string;
  state: string;
  pincode: string;
  metaFbc?: string | null;
  metaFbp?: string | null;
  utmData?: string | null;
  createdAt: Date;
  eventSourceUrl?: string | null;
  clientIp?: string | null;
  clientUa?: string | null;
};

/**
 * Sends server-side Purchase event to Meta Conversions API.
 * Only call this when money has actually hit the bank.
 */
export async function sendPurchaseCapi(order: CapiOrder & { valueOverride?: number }) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.log('[CAPI] Skipped: META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set');
    return { ok: false, skipped: true };
  }

  const [firstName, ...rest] = order.fullName.trim().split(/\s+/);
  const lastName = rest.join(' ');

  const userData: Record<string, any> = {
    ph:      [sha256(`91${order.mobile.replace(/\D/g, '')}`)],
    fn:      [sha256(firstName)],
    ct:      [sha256(order.city)],
    st:      [sha256(order.state)],
    zp:      [sha256(order.pincode)],
    country: [sha256('in')],
  };
  if (lastName)          userData.ln = [sha256(lastName)];
  if (order.email)       userData.em = [sha256(order.email)];
  if (order.metaFbc)     userData.fbc = order.metaFbc;
  if (order.metaFbp)     userData.fbp = order.metaFbp;
  if (order.clientIp)    userData.client_ip_address = order.clientIp;
  if (order.clientUa)    userData.client_user_agent = order.clientUa;

  const customData: Record<string, any> = {
    currency: 'INR',
    value:    order.valueOverride ?? order.paidAmount,
    order_id: order.orderNumber,
  };

  if (order.utmData) {
    try {
      const utm = JSON.parse(order.utmData);
      Object.entries(utm).forEach(([k, v]) => {
        if (k.startsWith('utm_') || k === 'fbclid' || k === 'gclid') {
          customData[k] = String(v).slice(0, 200);
        }
      });
    } catch {}
  }

  const payload: any = {
    data: [{
      event_name:       'Purchase',
      event_time:       Math.floor(order.createdAt.getTime() / 1000),
      event_id:         `purchase-${order.orderNumber}`,
      action_source:    'website',
      event_source_url: order.eventSourceUrl || process.env.NEXT_PUBLIC_SITE_URL,
      user_data:        userData,
      custom_data:      customData,
    }],
  };
  if (TEST_CODE) payload.test_event_code = TEST_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const data = await res.json();
    if (!res.ok) console.error('[CAPI] Failed:', data);
    else         console.log('[CAPI] Purchase sent for', order.orderNumber, '- value:', customData.value);
    return { ok: res.ok, data };
  } catch (error) {
    console.error('[CAPI] Network error:', error);
    return { ok: false, error };
  }
}




