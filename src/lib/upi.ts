// src/lib/upi.ts
// Builds UPI deep-link URLs that open native apps (GPay, PhonePe, Paytm)

const UPI_ID = 'powernutrition@nyes'; // Replace with your real UPI ID
const PAYEE_NAME = 'Rose and Co';

export interface UPIParams {
  amount: number;
  orderId: string;
  note?: string;
}

// Generic UPI intent (works on all UPI apps)
export function buildUPIUrl({ amount, orderId, note = 'Rose and Co order' }: UPIParams): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `${note} #${orderId}`,
    tr: orderId,
  });
  return `upi://pay?${params.toString()}`;
}

// GPay-specific (better fallback behavior on Android)
export function buildGPayUrl(params: UPIParams): string {
  const upi = buildUPIUrl(params);
  return `tez://upi/pay?${upi.split('?')[1]}`;
}

// PhonePe-specific
export function buildPhonePeUrl(params: UPIParams): string {
  return `phonepe://pay?${buildUPIUrl(params).split('?')[1]}`;
}

// Paytm-specific
export function buildPaytmUrl(params: UPIParams): string {
  return `paytmmp://pay?${buildUPIUrl(params).split('?')[1]}`;
}

// Detect if user is on mobile
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Detect if user is on Android specifically
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

// Detect iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Generate unique order ID
export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RC${ts}${rand}`;
}



