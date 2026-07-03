# Patch v14 — On-site conversion + trust additions

Everything free-to-use, self-hosted, no external services.

## New features shipping

### Trust boosters
- **Made in India badge** in header (with Indian flag colors)
- **Trust badges row** on product page (Free shipping / 24-48h / 7-day return / UPI)
- **UPI logos row** on cart + checkout (visual trust)
- **Ships-in counter** on product page (dynamic: "Order in 3h 20m to ship today")
- **Founder note + placeholder photo** on About page
- **Cart reviews snippet** (3 reviews shown in cart before checkout)
- **Customer photos gallery** on homepage (UGC section)

### Design + UX
- **Testimonials carousel** on homepage (auto-scrolling every 5s)
- **Interactive size chart** on product page (click size to see measurements)
- **Comparison table** on product page (Amara vs Zara vs Urbanic vs Instagram brands)
- **Share button** on product page (uses Web Share API on mobile, copy on desktop)
- **Progress bar** during checkout (visual bar above 1-2-3 steps)
- **Micro-animation** on Add to Bag click (button bumps briefly)

### Conversion features
- **Wishlist system** (localStorage-based, no signup) with heart icon in header + count badge
- **Wishlist page** at `/wishlist` to see saved products
- **Recently viewed** section on product page bottom (localStorage)
- **Gift wrap add-on** (Rs 49) checkbox during checkout
- **Reorder this** button on Thank You page
- **How did it fit?** email survey link on Thank You page

### Mobile
- **PWA support** — users can "Add to Home Screen"
- **PWA install prompt** appears after 20 seconds (dismissable)
- **Manifest.json** with brand colors and app icon
- **Apple touch icon** for iOS home screen

### Optional (env-controlled)
- **WhatsApp floating button** — only shows if `NEXT_PUBLIC_WHATSAPP_NUMBER` is set

## What is NOT included (per your request)
- SMS notifications (needs paid provider)
- Email sequences (needs paid provider like Resend/SendGrid)
- AI stylist recommendation (needs API)
- Live chat (needs paid service like Crisp/Intercom)
- Instagram feed embed (rate-limited by Meta)
- Video/reels (needs actual video files from you)

## Install
1. Extract patch over `C:\rose-and-co`, replace files
2. `npm run dev` locally
3. Verify wishlist, share, size chart interactive
4. Push to GitHub, Vercel auto-deploys

## Optional post-install
- Add `NEXT_PUBLIC_WHATSAPP_NUMBER=918340474678` in Vercel env vars to show the WhatsApp button
