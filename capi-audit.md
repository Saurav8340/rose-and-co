# Meta CAPI Readiness Audit — Rose & Co
_Read-only scan of 163 code files · 2/8/2026, 12:21:17 am_

## 🟢 Verdict: 92/100
**READY — your delayed/manual model can attribute and optimize. QA the live events, then you can test ads.**

The four signals that decide everything: fbc **✅**, event_id **✅**, CAPI POST **✅**, Purchase **✅**.

## Checklist
| Status | Signal | Weight | Found in |
|---|---|---|---|
| ⚪ | Meta Pixel base code present | 10 | — |
| ✅ | AddToCart / ViewContent events | 8 | `src/lib/pixel.ts` |
| ✅ | fbc (fbclid / _fbc cookie) captured | 20 | `src/app/checkout/page.tsx`, `src/lib/metaCapi.ts`, `src/lib/utm.ts` |
| ✅ | fbp (_fbp cookie) captured | 12 | `src/app/checkout/page.tsx`, `src/lib/metaCapi.ts` |
| ✅ | event_id generated & stored per order | 15 | `src/lib/metaCapi.ts`, `src/lib/pixel.ts` |
| ✅ | CAPI call to graph.facebook.com | 20 | `src/lib/metaCapi.ts` |
| ✅ | Purchase event fired somewhere | 12 | `src/app/admin/orders/[id]/UpdateOrderForm.tsx`, `src/lib/metaCapi.ts` |
| ✅ | Original event_time preserved for delayed send | 10 | `src/app/admin/export/route.ts`, `src/app/admin/leads/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/products/page.tsx` |
| ✅ | CAPI access token via env (not hard-coded) | 8 | `src/lib/metaCapi.ts` |
| ✅ | Customer PII hashed (SHA-256) for match | 6 | `src/lib/metaCapi.ts` |
| ✅ | Admin “payment confirmed” hook exists | 5 | `src/app/faq/page.tsx`, `src/app/order-success/page.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/shipping-policy/page.tsx` |

_✅ present · 🔴 critical & missing · ⚪ optional & missing_

## ✅ No critical gaps — nice.

## What "ready" means for your manual model
Your plan (order logged with Pixel data → confirm in admin → fire event) is valid **only** if:
1. **fbc + fbp + event_id are stored at ORDER time** (not confirm time).
2. Confirmation fires a **real CAPI Purchase** to graph.facebook.com (not a CSV upload).
3. The CAPI payload uses the **original order event_time** (7-day window).
4. You confirm within ~24–48h for healthy optimization.

If the audit shows those green, QA with Meta's **Test Events** tool, then launch a small test.
If red, that's the code to add next.
