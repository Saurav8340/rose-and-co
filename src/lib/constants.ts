export const SITE = {
  name: 'Rosé & Co',
  tagline: 'Clothing for the unbothered. Small drops, real hardware.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: 'care@roseandco.in',
  address: 'Gurugram, Haryana, India',
  instagram: 'https://instagram.com/roseandco',
};

export const UPI = {
  id:   process.env.NEXT_PUBLIC_UPI_ID || 'powernutrition@nyes',
  name: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'Rose And Co',
};

// ============================================================
// PRICING RULES — these are FORMULAS, not fixed amounts.
// Every product sets its own price + compareAt (MRP) in the admin
// panel. Checkout, product pages, and cart all calculate prepaid
// price and COD deposit FROM that product's own price using the
// rules below — so uploading a new product with a new price
// auto-updates every page that shows it. Nothing here is
// per-product; this file only defines the RULES.
// ============================================================

export const PAYMENT_RULES = {
  // UPI prepaid gets a flat rupee discount off the product's selling price.
  prepaidDiscountFlat: 100,

  // Partial COD: buyer pays this flat deposit online, rest in cash.
  // If a product's price is lower than this deposit, the deposit
  // is capped to a percentage instead so it never exceeds the price.
  codDepositFlat: 299,
  codDepositMaxPercent: 0.25, // deposit never exceeds 25% of price on cheap items

  // Fallback MRP multiplier ONLY used if a product has no compareAt
  // set in the admin panel (so a "% off" badge still has something
  // to show). Set compareAt per-product in admin to override this.
  fallbackMrpMultiplier: 1.5,
};

/**
 * Given a product's actual selling price, returns the UPI prepaid price.
 * Use this everywhere instead of a hardcoded PAYMENT.prepaidPrice.
 */
export function getPrepaidPrice(price: number): number {
  return Math.max(price - PAYMENT_RULES.prepaidDiscountFlat, 0);
}

/**
 * Given a product's actual selling price, returns how much is collected
 * online upfront for partial COD orders.
 */
export function getCodDeposit(price: number): number {
  const capped = Math.round(price * PAYMENT_RULES.codDepositMaxPercent);
  return Math.min(PAYMENT_RULES.codDepositFlat, capped) || PAYMENT_RULES.codDepositFlat;
}

/**
 * Given a product's actual selling price, returns how much is collected
 * in cash on delivery for partial COD orders.
 */
export function getCodRemaining(price: number): number {
  return price - getCodDeposit(price);
}

/**
 * Given a product's actual selling price and its compareAt (MRP) from
 * the database, returns the MRP to display. Falls back to a multiplier
 * only if the product has no compareAt set.
 */
export function getDisplayMrp(price: number, compareAt: number | null): number {
  if (compareAt && compareAt > price) return compareAt;
  return Math.round(price * PAYMENT_RULES.fallbackMrpMultiplier);
}

/**
 * Given a product's price and compareAt, returns the discount percentage
 * to show on a badge (e.g. "23% off"). Returns 0 if there's no real MRP.
 */
export function getDiscountPercent(price: number, compareAt: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;




