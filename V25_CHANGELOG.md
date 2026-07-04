# Patch v25 - Quieter voice, cleaner surfaces

## What changed

### Voice
Rewrote About, FAQ, home page, and product page in a warmer, less bullet-pointy tone. Fewer facts stacked on top of each other. Real books trust the reader; we should too.

### Founder note
Shorter. Reads like a note left on a desk, not a marketing pitch. Removed the pricing story and the studio address (those live on About).

### Pricing display
Product page now shows one price block. No double-boxed 'UPI prepaid' and 'Cash on delivery' info panels competing for attention. Payment method choice lives at checkout, where it belongs.

### Homepage
Removed the discount badge, the 'GST included / free shipping / UPI prepaid / COD' info dump under the hero button, and the second badge on the product image. Just: price, was-price, Buy button.

### Cart
Removed the two info boxes (UPI savings, COD split). One line at the bottom: 'Payment method chosen at checkout.'

### Checkout
Kept the payment selector clean. Removed the extra 'Amount to pay' emphasis boxes and duplicated info. Sidebar shows summary numbers only.

### Announcement bar and TrustBar
Removed pricing from the marquee and from the trust badges. If someone wants the price, they scroll two inches.

## Files touched

- src/app/about/page.tsx
- src/app/page.tsx
- src/app/faq/page.tsx
- src/app/cart/page.tsx
- src/app/checkout/page.tsx
- src/app/product/[slug]/ProductClient.tsx
- src/components/FounderNote.tsx
- src/components/AnnouncementBar.tsx
- src/components/TrustBar.tsx
- src/components/StickyBuyBar.tsx

## Install

Extract patch over C:\rose-and-co, replace files. Restart dev. Push.

```
git add .
git commit -m "v25: quieter voice, cleaner pricing surface"
git push
```

## What did not change

- Any pricing (Rs 2,000 SP, Rs 3,499 MRP, Rs 1,900 prepaid, Rs 299 COD deposit remain intact)
- Captcha behavior
- Meta pixel and CAPI
- Database schema, product data
- Any URLs

Just the words. And the way they sit on the page.
