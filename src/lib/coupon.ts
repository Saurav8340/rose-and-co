// src/lib/coupon.ts
// Human-friendly coupon code generator

const DELIGHT_WORDS = ['WELCOME', 'FIRST', 'HELLO', 'SWEET', 'ROSE', 'BLOOM'];
const VIP_WORDS = ['VIP', 'INSIDER', 'LOYAL', 'FAVOURITE'];

export interface CouponContext {
  name?: string;
  product?: string;
  segment: 'real_intent' | 'returning_vip' | 'browser' | 'coupon_hunter';
  discountPct: number;
}

export function generateCoupon(ctx: CouponContext): string {
  const cleanName = ctx.name
    ? ctx.name.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12)
    : '';

  if (ctx.segment === 'returning_vip' && cleanName) {
    return `${cleanName}-VIP`;
  }

  if (ctx.segment === 'returning_vip') {
    const word = VIP_WORDS[Math.floor(Math.random() * VIP_WORDS.length)];
    return `${word}${ctx.discountPct}`;
  }

  if (cleanName) {
    return `${cleanName}${ctx.discountPct}`;
  }

  if (ctx.product) {
    const word = DELIGHT_WORDS[Math.floor(Math.random() * DELIGHT_WORDS.length)];
    return `${word}-${ctx.product}`;
  }

  const word = DELIGHT_WORDS[Math.floor(Math.random() * DELIGHT_WORDS.length)];
  return `${word}${ctx.discountPct}`;
}

export function humanizeCode(rawCode: string): string {
  if (!rawCode) return 'WELCOME10';
  if (rawCode.length < 20 && !rawCode.includes('_')) return rawCode;
  return 'WELCOME10';
}
