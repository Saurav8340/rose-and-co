// next.config.security.mjs — security headers + Content-Security-Policy.
// Fixes the "No Content-Security-Policy" finding and adds baseline hardening.
//
// HOW TO USE: merge the `securityHeaders` array and the `headers()` function
// into your existing next.config.(mjs|js). If you don't have one, rename this
// file to next.config.mjs.
//
// IMPORTANT: adjust the CSP source lists to match the third parties you load
// (Meta Pixel, GA4/GTM, Stripe, fonts, your image CDN). Start in Report-Only,
// watch the browser console, then switch to enforcing.

// ---- Tune these to YOUR stack (Rose & Co likely uses some of these) ----
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is needed for Next inline runtime + JSON-LD; tighten later with nonces
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://www.facebook.com https://www.google-analytics.com https://*.stripe.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://www.google-analytics.com https://connect.facebook.net https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://www.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Switch to "Content-Security-Policy" once you've confirmed nothing breaks:
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // If you already have image config etc., keep it and just add headers():
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
