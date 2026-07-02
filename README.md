# Rosé & Co — Production D2C E-commerce

Next.js 14 · TypeScript · Tailwind · Prisma · SQLite (swap to Postgres in prod)

Single product store for **Amara Marble Swirl Co-ord Set — ₹1,499**, built for Meta Ads day-1 traffic.

## ✨ What's Included

- **Home / Product / Cart / Checkout / Order Success / Track / Admin** — full flow, no placeholders
- **Captcha verification** (SVG-rendered, alphanumeric, server-validated) — replaces SMS OTP as per your choice
- **UPI Payment** — QR code + deep links (GPay / PhonePe / Paytm / Any UPI) + manual UTR entry
- **Manual payment verification** via admin dashboard
- **Two payment methods** — Full Prepaid (₹1,499) & Partial COD (₹300 online + ₹1,199 on delivery)
- **Admin dashboard** — order search/filter/CSV export, status updates, revenue stats, product view
- **Meta Pixel** ready — env var driven; wires PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase with deduplication event IDs
- **GA4 & GTM** optional (env-driven, blank = disabled)
- **SEO** — dynamic metadata, JSON-LD product schema, sitemap.xml, robots.ts, OG tags
- **Security** — HSTS, X-Frame-Options, CSP-ready headers, rate limiting (captcha/verify/order/admin), JWT admin sessions, input validation via Zod
- **PIN code auto-fill** via postalpincode.in
- **Mobile-first** — sticky buy bar, touch-friendly size selector, one-hand checkout
- **Policies** — Privacy, Refund, Shipping, Terms, Cancellation, FAQ, 404, About, Contact
- **Trust elements** — announcement bar, trust badges, review section, countdown, delivery estimator

## 🚀 Quick Start (Local)

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# Edit ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET (min 32 chars), NEXT_PUBLIC_META_PIXEL_ID

# 3. Add product images to /public/products/
#    - amara-front.png
#    - amara-back.png
#    - amara-left.png
#    - amara-right.png
#    - amara-fabric.png

# 4. Initialize database
npx prisma db push
npm run db:seed

# 5. Run
npm run dev
# → http://localhost:3000
# → Admin: http://localhost:3000/admin/login
```

## 🖼️ Product Images

Place these 5 images into `public/products/`:

| File                    | View                    |
|-------------------------|-------------------------|
| `amara-front.png`       | Hero front              |
| `amara-back.png`        | Back view               |
| `amara-left.png`        | Left profile            |
| `amara-right.png`       | Right profile           |
| `amara-fabric.png`      | Fabric close-up / skirt |

Use the images you attached in your prompt — resize to ~1200×1600 for best performance.

## 🔐 Admin

- URL: `/admin/login`
- Credentials: `ADMIN_EMAIL` + `ADMIN_PASSWORD` from `.env`
- Session valid 12 hours (JWT httpOnly cookie)
- Actions:
  - View, search, filter orders
  - Mark payment `VERIFIED` after checking UPI ID `8340474678@pthdfc`
  - Update order status: PLACED → CONFIRMED → PACKED → SHIPPED → DELIVERED
  - Export all orders as CSV
  - View product stock

**Manual UPI Verification Workflow:**
1. Customer places order → captcha verified → sees QR → pays → enters UTR
2. Order lands in admin with `paymentStatus: PENDING`
3. You check your UPI app for the incoming amount + matching UTR
4. If matched → mark `VERIFIED` and set order status to `CONFIRMED`
5. Proceed with fulfillment

## 📱 Meta Pixel Setup

1. Get your Pixel ID from Facebook Events Manager
2. Add to `.env`: `NEXT_PUBLIC_META_PIXEL_ID="1234567890"`
3. Redeploy
4. Events fire automatically with dedup `eventID`:
   - `PageView` (all pages)
   - `ViewContent` (product page)
   - `AddToCart` (add-to-cart click)
   - `InitiateCheckout` (cart page load)
   - `AddPaymentInfo` (address submit)
   - `Purchase` (order success)

## 🚢 Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "init"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

# 2. Import in Vercel
# 3. Add env vars in Vercel dashboard (copy from .env.example, set real values)
# 4. IMPORTANT: switch DATABASE_URL to Postgres for production
#    - Use Vercel Postgres, Neon, or Supabase
#    - Update prisma/schema.prisma: provider = "postgresql"
#    - Push schema: npx prisma db push
# 5. Deploy
```

## 🗃️ Swap to Postgres (Production)

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then:
```bash
DATABASE_URL="postgres://..." npx prisma db push
DATABASE_URL="postgres://..." npm run db:seed
```

## 📂 Structure

```
├─ prisma/
│  ├─ schema.prisma        # Product / Order / VerificationSession / AdminLog
│  └─ seed.ts              # Seeds Amara product
├─ public/
│  └─ products/            # Product images (add manually)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx          # Home
│  │  ├─ product/[slug]/   # Product page + client
│  │  ├─ cart/             # Cart
│  │  ├─ checkout/         # 3-step checkout (address → verify → payment)
│  │  ├─ order-success/    # Confirmation page
│  │  ├─ order-failure/    # Failure fallback
│  │  ├─ track/            # Order tracking
│  │  ├─ admin/            # Admin dashboard
│  │  ├─ api/              # All API routes
│  │  │  ├─ captcha/       # generate + verify
│  │  │  ├─ payment/       # UPI QR
│  │  │  ├─ orders/        # create + track
│  │  │  └─ admin/         # login / logout / orders / export
│  │  ├─ [policies].tsx    # Privacy, Refund, Shipping, Terms, etc.
│  │  ├─ robots.ts / sitemap.ts
│  │  └─ layout.tsx        # Pixel, GTM, GA4 injection
│  ├─ components/          # Header, Footer, Cart, Gallery, SizeSelector, etc.
│  ├─ lib/                 # captcha, session, pixel, validate, pincode, etc.
│  └─ middleware.ts        # Basic protection headers
├─ .env.example
├─ next.config.js          # Security headers, image optimization
├─ tailwind.config.ts      # Rosé & Co brand palette + fonts
└─ package.json
```

## 🛡️ Security Checklist

- [x] HTTPS enforced via HSTS header
- [x] X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] Zod validation on every API input
- [x] Rate limiting on captcha, verify, order-create, admin-login
- [x] JWT (jose) admin sessions with httpOnly, secure, sameSite cookies
- [x] SQL injection prevented via Prisma parameterized queries
- [x] Captcha with expiry (10 min) + max 5 attempts per session
- [x] Session-token binding between mobile + captcha + order
- [x] Admin routes noindex via middleware

## 📈 Post-Launch Tasks

1. **Facebook CAPI** — currently client-side only. For iOS 14+ accuracy, wire server-side CAPI:
   - Add `FB_CAPI_TOKEN` to env
   - POST to `graph.facebook.com/v18.0/{pixelId}/events` from `/api/orders/create` after order save
2. **SMS confirmations** — plug in MSG91 / Fast2SMS if needed later
3. **Payment gateway** — swap manual UTR → Razorpay/Cashfree webhook when volume increases
4. **Reviews** — add Judge.me or custom review model
5. **Upsells / Related products** — add to cart page and product page
6. **Meta Ads Pixel test** — use Facebook Pixel Helper Chrome extension to verify events fire correctly before scaling ad spend

## 🎨 Brand DNA (locked in Tailwind)

| Token       | Hex        | Usage                        |
|-------------|-----------|------------------------------|
| `blush`     | `#F4DCD6` | Backgrounds, cards           |
| `rose`      | `#B03A4C` | Hover states                 |
| `champagne` | `#E8D5B7` | Accents                      |
| `wine`      | `#5C1A2B` | Primary CTA, prices          |
| `ivory`     | `#FAF6F0` | Body background              |
| `taupe`     | `#8B7568` | Borders, secondary text      |
| `espresso`  | `#2B1810` | Primary text                 |

Fonts: **Playfair Display** (display) · **Italiana** (product names) · **Inter** (body)

---

**Made for the girl who walks slow and hits hard. 🌹**
