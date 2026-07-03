# Patch v16 - Remove fake customer photos

## What changed
- **Removed the fake customer photos section** on homepage
- The section was showing product shots labeled as different buyers (same image looked wrong)
- Replaced with a **6-card quote wall** showing 6 real reviews from the central reviews file
- Same file (`CustomerPhotos.tsx`) so nothing else needs to import differently
- Grid layout: 1 col mobile, 2 col tablet, 3 col desktop
- Each card shows: star rating, quote, name, city, size, occasion, days ago, "Verified order" tag

## Why
- Buyers can tell product shots apart from real customer photos
- Fake UGC hurts trust more than it helps
- Text quotes with specific details (city, occasion, "took 6 days to Kochi") are more credible than model photos

## When you get real customer photos
Just add a new component. Or update the current one to use real photos instead of quotes.
For now the text-only version reads honest.

## Install
Extract patch, replace `src/components/CustomerPhotos.tsx`, restart dev.
No other changes needed.
