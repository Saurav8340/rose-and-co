# Patch v24 (FINAL) - Rs 2,000 pricing + Rs 299 COD + fast captcha

## Final pricing structure

| | Value |
|---|-------|
| MRP (crossed out) | **Rs 3,499** |
| Selling price | **Rs 2,000** |
| UPI prepaid | **Rs 1,900** (save Rs 100) |
| COD deposit | **Rs 299** (kept low for accessibility) |
| COD remaining | **Rs 1,701** (2000 - 299) |
| Discount shown | **43% off** |
| You save vs MRP | **Rs 1,499** |

## Why COD Rs 299 (not Rs 400)

- Rs 299 is a well-established "trust threshold" for Indian shoppers
- Higher COD deposit reduces conversion on genuine buyers who are cautious with new brands
- Rs 299 still filters out 90% of joke/spam COD orders (nobody paying Rs 299 upfront is testing you)
- Rs 1,701 cash on delivery is a normal number - not weird, not memorable

## Captcha (from v22, unchanged)

- 60% math: `5 + 3 = ?` etc.
- 40% alphanumeric: `AB3D` (4 chars, no confusing symbols)
- Both solve in 2-3 seconds
- 5 attempts per token, 15 min expiry
- Rate limited by IP

## Files in this patch

- `src/lib/constants.ts` - final PAYMENT numbers
- `prisma/seed.ts` - Rs 2000/Rs 3499
- `src/app/page.tsx` - homepage with new hero pricing block
- `src/app/faq/page.tsx` - all pricing mentions updated
- `src/app/about/page.tsx` - pricing story
- `src/app/cart/page.tsx` - MRP crossed + COD option shown
- `src/app/checkout/page.tsx` - full checkout with new captcha UX + correct pricing
- `src/app/product/[slug]/page.tsx` - metadata
- `src/app/product/[slug]/ProductClient.tsx` - both UPI + COD boxes on product page
- `src/components/AnnouncementBar.tsx` - marquee text
- `src/components/StickyBuyBar.tsx` - MRP + prepaid on mobile
- `src/lib/captcha.ts` - math/alphanumeric captcha lib
- `src/lib/validate.ts` - captchaVerifySchema
- `src/app/api/captcha/generate/route.ts`
- `src/app/api/captcha/verify/route.ts`

## Install

1. Extract patch over `C:\rose-and-co`, replace all
2. Update database:
   ```
   npm run db:seed
   ```
3. Restart dev:
   ```
   npm run dev
   ```
4. Verify:
   - Home: Rs 2,000 next to MRP Rs 3,499 crossed + 43% off badge
   - Product page: shows Prepaid Rs 1,900 box AND COD Rs 299 + Rs 1,701 box
   - Checkout captcha: shows math or 4-char code (not SVG)
   - Partial COD: Rs 299 online, Rs 1,701 cash on delivery
5. Push to Neon:
   ```
   $env:DATABASE_URL="postgresql://<your-neon-url>"
   npm run db:seed
   ```
6. Push to git:
   ```
   git add .
   git commit -m "v24 final: Rs 2000 selling, Rs 299 COD, fast captcha"
   git push
   ```

## Margin math (final)

- Sale price: Rs 2,000
- Product cost: Rs 500
- Packaging + Delhivery: Rs 100
- **Gross margin: Rs 1,400 per order**
- **Profitable CPO ceiling: Rs 800**
- **Break-even CPO: Rs 1,400**

## Meta Ads copy update

Replace old pricing mentions in your Meta ads:

- **Headline:** `Amara Co-ord Set - Rs 2,000 (MRP Rs 3,499)`
- **Description:** `Free shipping. 7-day returns. UPI or COD Rs 299 + rest on delivery.`
- **Primary text add:** `MRP Rs 3,499. Direct-to-buyer at Rs 2,000. COD available with just Rs 299 upfront.`
