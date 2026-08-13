'use client';

/**
 * MetaPixel.tsx — the BROWSER Meta Pixel base loader that was missing.
 *
 * WHY: your src/lib/pixel.ts already calls window.fbq('track', …), but nothing
 * ever created window.fbq or loaded fbevents.js — so those calls did nothing.
 * This mounts the base Pixel once, fires PageView, and re-fires PageView on
 * client-side route changes (App Router SPA navigations don't reload the page).
 *
 * SETUP (2 steps):
 *   1. In .env.local add (note the NEXT_PUBLIC_ prefix — required for the browser):
 *        NEXT_PUBLIC_FB_PIXEL_ID=your_15_or_16_digit_id
 *   2. In src/app/layout.tsx, inside <body>, render <MetaPixel /> once:
 *        import MetaPixel from '@/components/MetaPixel';
 *        ...
 *        <body>
 *          <MetaPixel />
 *          {children}
 *        </body>
 *
 * After this, Pixel Helper will detect the Pixel and PageView on the prod build,
 * _fbp will be set (improving your CAPI Event Match Quality), and your existing
 * pixel.ts helpers (AddToCart, ViewContent) will actually fire.
 */

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PIXEL_ID) return;
    // Fire PageView on every client-side navigation (SPA route change).
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  if (!PIXEL_ID) {
    // Fail loud in dev so a missing env var is obvious, silent in prod.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[MetaPixel] NEXT_PUBLIC_FB_PIXEL_ID is not set — Pixel will not load.');
    }
    return null;
  }

  return (
    <>
      {/* Base Pixel: defines window.fbq, loads fbevents.js, inits, first PageView. */}
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* <noscript> fallback pixel for users with JS disabled. */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Re-fire PageView on SPA route changes. Suspense: useSearchParams needs it. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}



