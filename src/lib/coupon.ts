// src/lib/coupon.ts
// Human-friendly coupon generator. Real words, memorable, personal.

const NICE_WORDS = ['WELCOME', 'HELLO', 'BLOOM', 'ROSE', 'GRACE', 'FIRST'];
const VIP_WORDS = ['VIP', 'LOYAL', 'INSIDER', 'FAVOURITE'];

export interface CouponContext {
  name?: string;
  product?: string;
  segment: 'real_intent' | 'returning_vip' | 'browser' | 'coupon_hunter';
  discountPct: number;
}

/**
 * Generate a human-friendly coupon.
 * Examples:
 *   name='Saurav' -> 'SAURAV10'
 *   name='Priya', segment='returning_vip' -> 'PRIYA-VIP'
 *   no name -> 'WELCOME10' / 'BLOOM10' / etc.
 *   coupon_hunter -> 'HELLO5'
 */
export function generateCoupon(ctx: CouponContext): string {
  const cleanName = ctx.name
    ? ctx.name.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10)
    : '';

  if (ctx.segment === 'returning_vip' && cleanName) return `${cleanName}-VIP`;
  if (ctx.segment === 'returning_vip') {
    const word = VIP_WORDS[Math.floor(Math.random() * VIP_WORDS.length)];
    return `${word}${ctx.discountPct}`;
  }

  if (cleanName) return `${cleanName}${ctx.discountPct}`;

  if (ctx.segment === 'coupon_hunter') return `HELLO${ctx.discountPct}`;

  const word = NICE_WORDS[Math.floor(Math.random() * NICE_WORDS.length)];
  return `${word}${ctx.discountPct}`;
}

/**
 * Turn any ugly stored code into a friendly display.
 * Old sessions had codes like AMAR-SAU-K9M -> return WELCOME10 fallback.
 */
export function humanizeCode(rawCode: string | null | undefined): string {
  if (!rawCode) return 'WELCOME10';
  if (rawCode.length <= 15 && !/-{2,}/.test(rawCode)) return rawCode;
  return 'WELCOME10';
}
