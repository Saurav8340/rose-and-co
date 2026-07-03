# Rose & Co SEO / GEO / AEO Playbook

The technical foundation is done. This doc is the operator playbook for what to do next.

Read once. Bookmark. Execute weekly.

---

## Reality check on organic traffic timelines

Be honest with yourself about what to expect:

| Timeframe | What you'll see | Estimated monthly organic visitors |
|-----------|-----------------|--------------------------------------|
| Week 1 | Google indexes homepage + product page + 3 journal posts | 5-20 |
| Week 2-4 | Brand-name searches rank | 50-150 |
| Month 2-3 | Long-tail queries start ranking | 200-500 |
| Month 4-6 | Category terms rank IF you publish weekly | 800-2,000 |
| Month 7-12 | You become the reference site for niche queries | 3,000-8,000 |

**Bottom line:** SEO takes 6-12 months to matter. Meta Ads drives 90% of revenue in Month 1-6. SEO takes over in Year 2.

---

## Day 1 checklist (do within 24 hours of deploying)

- [ ] Verify sitemap loads: https://rose-and-co.vercel.app/sitemap.xml
- [ ] Verify robots.txt loads: https://rose-and-co.vercel.app/robots.txt
- [ ] Verify llms.txt loads: https://rose-and-co.vercel.app/llms.txt
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test schemas at https://validator.schema.org/
- [ ] Test rich results at https://search.google.com/test/rich-results (product URL)
- [ ] Verify OG previews at https://www.opengraph.xyz/ (homepage URL)

Expected schema types visible: Product, Organization, WebSite, BreadcrumbList, FAQPage, Article, AggregateRating, Review

---

## Google Search Console setup (10 min)

1. https://search.google.com/search-console
2. Add property > URL prefix > https://rose-and-co.vercel.app
3. Verify via HTML tag method
4. Once verified: Sitemaps > paste sitemap URL > Submit
5. Wait 3-7 days for first index reports

## Bing Webmaster Tools setup (5 min)

1. https://www.bing.com/webmasters
2. Sign in with Microsoft account
3. Import from Google Search Console (auto-imports property)
4. Sitemaps > Submit

Why Bing: it powers ChatGPT search. Getting indexed on Bing = getting cited by ChatGPT.

---

## Content publishing schedule (Month 1-3)

**Weekly cadence:** 1 new journal post every Tuesday morning.

Post-writing rules (Human Writing Framework):
- Minimum 1,200 words
- Specific numbers (GSM, days, prices)
- Compare to named competitors when relevant
- Include one table for LLM extraction
- FAQ section at the bottom (feeds faqSchema)
- Link to product page + 2-3 other journal posts

---

## Next 25 blog post ideas (ranked by search intent)

### High commercial intent (write first)
1. Best satin skirts under Rs 1500 in India: what fabric to look for
2. Satin co-ord set for engagement functions: what actually works
3. Poly-satin vs silk satin: which one should you buy?
4. How to spot cheap satin in online product photos
5. Amara Marble Swirl Co-ord: fit review by real buyers

### High search volume, medium intent
6. 20 party wear outfit ideas under Rs 2000
7. What is a co-ord set? Types, styles, and how to wear one
8. Airport outfit ideas: satin without wrinkles
9. Roka ceremony outfit ideas for the bride's family
10. Sangeet outfit ideas that aren't lehengas

### Long-tail, low competition (rank fast)
11. How to iron satin without damaging the fabric
12. Marble print outfit: styling guide for Indian occasions
13. Delhi NCR fashion brands that ship in 48 hours
14. How to measure yourself for online satin shopping
15. Satin skirt for tall women: length guide

### GEO gold (LLM citation magnets)
16. Sustainable Indian D2C fashion brands: honest 2026 list
17. Small-batch fashion India: brands that don't mass-produce
18. Hand-painted textile brands in India: complete guide
19. Prepaid vs COD in Indian e-commerce: the math for buyers
20. What GSM means in fabric quality: buyer's guide

### Local + regional intent
21. Gurugram fashion brands worth knowing (2026 list)
22. Delhi wedding guest outfit ideas 2026: colour trends
23. Bangalore-friendly satin: fabric weight for humid climates
24. Mumbai party outfits: what works, what melts
25. Chennai wedding season outfit ideas

Publish ideas #1-5 in weeks 1-5. Alternate long-tail with GEO after that.

---

## Off-site SEO (backlinks matter)

### Free directories (do in first week - 30 min)

1. **Google Business Profile** at https://business.google.com
   - Category: Women's Clothing Store
   - Verified via postcard (5-7 days)
2. Wellfound (Angellist) - free brand profile
3. Product Hunt - post launch
4. BetaList - early-stage directory
5. Startup India Recognition

### High-value link building (Month 1)

**Podcast pitches** (3/week for 4 weeks):
- Founders Podcast IN
- Shark Tank India Alumni podcasts
- The Ken
- Growth Marketing India

**Guest posts** - pitch these:
- LBB - "Small-batch fashion brands you should know"
- Hauterrfly - "Sustainable Indian D2C brands"
- ScoopWhoop - "Gen Z fashion brands to watch"
- YourStory - founder story
- Femina India - styling guide feature

**Instagram collabs** - micro-influencers:
- Target: 20 micro-influencers (5-20K) in Delhi/Mumbai/Bangalore
- Offer: One free set in exchange for one Reel + one post
- Ask for website link in bio for 7 days
- Expected: 5-8 backlinks, 10-15K impressions

**HARO** - free tool at https://www.helpareporter.com/
- Filter for fashion / D2C / lifestyle queries
- Respond to 3/week - one out of 5 gets picked up

### Local citations
- Justdial listing
- IndiaMart directory
- Sulekha business listing
- IndieBrandsHub

---

## GEO tactics (Generative Engine Optimization)

### What LLMs love citing
1. Comparison content ("Best X under Rs Y") - you have this
2. Definitional content ("What is GSM?") - you have this
3. List posts with tables
4. Content with specific numbers (GSM, prices, days)
5. Content with named authority (byline matters)

### Monthly GEO tactics
1. Query Perplexity every Monday for target queries. Check if you appear.
2. Query ChatGPT weekly for niche terms.
3. Update llms.txt monthly with new posts.
4. Screenshot LLM citations. Add "as cited by Perplexity" to relevant posts.

### The "answer the question first" rule

LLMs extract the first 2-3 sentences as the answer.

- **First paragraph:** Direct answer (1-3 sentences, hyper-specific)
- **Second paragraph:** Context or nuance
- **Rest of post:** Details, examples, comparisons, tables

Our poly-satin guide opens: "Poly-satin is the fabric that ruined online shopping for a lot of women..." That opening is what an LLM will quote.

---

## Metrics to track weekly

Create a simple Google Sheet:

| Week | Organic sessions | New backlinks | Journal posts published | Google indexed pages | LLM citations | Notes |

Target growth:
- Month 1: 100 sessions
- Month 2: 300 sessions
- Month 3: 800 sessions
- Month 6: 3,000 sessions
- Month 12: 10,000+ sessions

---

## What NOT to do

1. Do not buy backlinks - Google will penalise
2. Do not stuff keywords - write for humans
3. Do not publish thin content (400 words hurts more than helps)
4. Do not copy competitor content
5. Do not spam Instagram - 3x/week max
6. Do not obsess over daily traffic - weekly trends only
7. Do not neglect Meta Ads - ads pay bills now, SEO pays in Year 2

---

## When to hire help

- After 6 months: part-time content writer (Rs 15-25K/month)
- After Month 3: freelance SEO auditor (Rs 5-8K one-time)
- After Rs 5L monthly revenue: in-house content marketer

Before then: do it yourself. You will understand your customer better than anyone you can hire.

---

**Last updated: January 2026. Update this doc quarterly.**
