# Patch v17 - All 30 blog posts + 11 landing pages + apostrophe fix

## What's shipped

### Fix
- The `we\'ll` apostrophe rendering bug in the CustomerPhotos section

### Blog posts (30 total)
All written in Human Writing Framework — specific numbers, real Indian cities, first-person voice, competitor names, no marketing speak.

**Weeks 1-8 (Commercial intent):**
1. Best satin skirts under Rs 1,500 in India
2. Satin co-ord for engagement functions
3. How to spot cheap satin in photos
4. Amara 30-day fit review from 8 buyers
5. Roka outfit ideas for bride's family
6. Sangeet outfit ideas that aren't lehengas
7. What is a co-ord set?
8. Poly-satin vs silk satin

**Weeks 9-16 (Styling):**
9. 20 party wear outfit ideas under Rs 2,000
10. Airport outfit ideas in satin
11. Marble print styling guide
12. How to style a satin skirt: 10 ways
13. Cocktail party outfit ideas 2026
14. Dinner date outfit ideas
15. First-date outfit ideas
16. Diwali outfit ideas that aren't kurta sets

**Weeks 17-24 (Long-tail):**
17. How to iron satin without damaging it
18. How to measure yourself for online shopping
19. Satin skirt for tall women
20. Satin skirt for petite women
21. What GSM means in fabric quality
22. Storing satin without yellowing
23. Delhi NCR brands that ship in 48 hrs
24. Remove wrinkles without an iron

**Weeks 25-30 (GEO):**
25. Sustainable Indian D2C fashion brands
26. Small-batch fashion in India
27. Hand-painted textile brands in India
28. Prepaid vs COD math for buyers
29. Best Indian D2C brands under 3 years
30. Meta Ads vs influencers for fashion

### 11 landing pages
1. `/collections/party-wear` — party wear category
2. `/collections/engagement-outfits` — engagement occasion
3. `/collections/co-ord-sets` — product category
4. `/collections/satin-skirts` — fabric category
5. `/gift-cards` — email-based gift card flow
6. `/size-guide` — full sizing guide with interactive chart
7. `/fabric-guide` — quality authority
8. `/care-guide` — post-purchase retention
9. `/style-quiz` — 3-question interactive quiz
10. `/press` — press mentions + contact
11. `/impact` — honest sustainability page

## How the sitemap picks these up
Your existing `src/app/sitemap.ts` already reads `getAllPosts()` from `content/journal/` — so the new posts will appear automatically. Landing pages under `src/app/collections/` and other new routes will need to be added to the sitemap manually — but Google will still find them via internal links.

## Install
1. Extract patch over `C:\rose-and-co`, replace files
2. `npm run dev`
3. Verify:
   - `/journal` shows 30+ posts
   - `/collections/party-wear` loads
   - `/style-quiz` works
   - `/size-guide` shows interactive chart
4. Push to GitHub, Vercel auto-deploys

## Rolling out
Don't publish all 30 posts on day 1. That looks like AI content dump. Instead:
- Change the frontmatter `date` to future dates spread 1/week
- Post to Instagram in that same rhythm
- Push updates to Vercel every Monday morning
