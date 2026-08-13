'use client';

import { useEffect, useState } from 'react';

export type UserSegment =
  | 'real_intent'      // High-value: viewed product 60+s, engaged
  | 'returning_vip'    // 3+ visits, previous address
  | 'browser'          // Casual browser, some engagement
  | 'bounce_risk'      // Low intent, protect margin
  | 'coupon_hunter';   // Direct from discount URL

export interface UserProfile {
  segment: UserSegment;
  name?: string;
  city?: string;
  visitCount: number;
  timeOnSite: number; // seconds
  hasAddress: boolean;
  deviceType: 'mobile' | 'desktop';
  discountCode?: string;
  discountPct: number;
  showDiscount: boolean;
}

// Personalized code generator
function generateCode(name: string | undefined, product: string, segment: UserSegment): string {
  const initials = name ? name.substring(0, 3).toUpperCase() : 'YOU';
  const productShort = product.substring(0, 4).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${productShort}-${initials}-${rand}`;
}

export function useUserSegment(currentProduct: string = 'AMARA'): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Read signals
    const name = localStorage.getItem('rc_name') || undefined;
    const visitCount = parseInt(localStorage.getItem('rc_visits') || '1', 10);
    const hasAddress = !!localStorage.getItem('rc_last_address');
    const startTime = Date.now();
    const deviceType: 'mobile' | 'desktop' = window.innerWidth < 768 ? 'mobile' : 'desktop';

    // Check if arrived from discount URL
    const cameFromDiscountUrl =
      window.location.search.includes('discount') ||
      document.referrer.includes('coupon') ||
      document.referrer.includes('discount');

    // Get city (silently)
    let city: string | undefined;
    fetch('/api/geo', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.city) city = data.city;
      })
      .catch(() => {});

    // Segment classification runs after 15 seconds
    const classifyTimer = setTimeout(() => {
      const timeOnSite = Math.floor((Date.now() - startTime) / 1000);
      const scrolled = window.scrollY > 400;

      let segment: UserSegment;

      if (cameFromDiscountUrl) {
        segment = 'coupon_hunter';
      } else if (visitCount >= 3 && hasAddress) {
        segment = 'returning_vip';
      } else if (timeOnSite >= 15 && scrolled) {
        segment = 'real_intent';
      } else if (timeOnSite >= 8) {
        segment = 'browser';
      } else {
        segment = 'bounce_risk';
      }

      // Decide discount based on segment
      let discountPct = 0;
      let showDiscount = false;
      let discountCode: string | undefined;

      switch (segment) {
        case 'returning_vip':
          discountPct = 15;
          showDiscount = true;
          discountCode = `VIP-${generateCode(name, currentProduct, segment)}`;
          break;
        case 'real_intent':
          discountPct = 10;
          showDiscount = true;
          discountCode = generateCode(name, currentProduct, segment);
          break;
        case 'browser':
          discountPct = 5;
          showDiscount = true;
          discountCode = generateCode(name, currentProduct, segment);
          break;
        case 'coupon_hunter':
          discountPct = 5; // Small margin protection
          showDiscount = true;
          discountCode = 'WELCOME5';
          break;
        case 'bounce_risk':
        default:
          discountPct = 0;
          showDiscount = false;
          break;
      }

      setProfile({
        segment,
        name,
        city,
        visitCount,
        timeOnSite,
        hasAddress,
        deviceType,
        discountCode,
        discountPct,
        showDiscount,
      });

      // Store discount for later checkout auto-apply
      if (discountCode && showDiscount) {
        localStorage.setItem('rc_active_code', discountCode);
        localStorage.setItem('rc_active_discount', String(discountPct));
      }
    }, 15000);

    return () => clearTimeout(classifyTimer);
  }, [currentProduct]);

  return profile;
}




