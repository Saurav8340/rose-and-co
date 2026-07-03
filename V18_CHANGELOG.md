# Patch v18 - YAML fix + FounderNote rewrite + missing 8 posts

## Fixes
1. **YAML error resolved** - the satin-skirt-for-petite-women.md and satin-skirt-for-tall-women.md had unescaped inch quotes in the title. Rewrote both with plain wording.
2. **FounderNote rewritten** - removed the vague "6 months in Surat + Rs 240/metre" pitch. Replaced with a real, short note in Saurav voice - his real age, real city, real intent. No pricing.

## Content added
8 missing posts from Weeks 1-8:
1. Best satin skirts under Rs 1,500 in India
2. Satin co-ord for engagement functions
3. How to spot cheap satin in photos
4. Amara 30-day fit review from 8 buyers
5. Roka outfit ideas for bride family
6. Sangeet outfit ideas that are not lehengas
7. What is a co-ord set?
8. Poly-satin vs silk satin

## Install
1. Extract patch over `C:\rose-and-co`, replace files
2. `npm run dev` - YAML error should be gone
3. Verify `/journal` shows all posts, `/about` shows the new founder note
4. Push to GitHub, Vercel auto-deploys

## After this patch
- Total blog posts on journal: 30 (v12 had 3, v17 added 19, v18 adds 8)
- Total landing pages: all 11 from v17
- All frontmatter clean, YAML valid
