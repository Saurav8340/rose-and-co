/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // NEW — safe to add on its own: isolates this site's top-level
          // window from other documents (e.g. pop-ups it opens), closing
          // off a class of cross-window attacks. Does not affect normal
          // page functionality, third-party scripts, or embeds.
          //
          // NOT added here: a Content-Security-Policy header. PageSpeed
          // Insights flagged its absence too, but a CSP is genuinely risky
          // to add blind — this site loads Meta Pixel, Instagram embeds,
          // Vercel Blob images/videos, and calls postalpincode.in from
          // the browser. A misconfigured CSP could silently break Meta
          // ad tracking or checkout without throwing an obvious error.
          // This needs to be built as an explicit allowlist of exactly
          // those domains and tested thoroughly on a preview deploy
          // before ever touching production — not something to guess at
          // in one pass. Flagging this as a separate follow-up task.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/products/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
