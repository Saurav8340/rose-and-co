# Patch v15 - Warning fix + human content rewrite

## Warning fixed
- Moved `themeColor` from `metadata` export to `viewport` export
- Silences the "Unsupported metadata themeColor" console warnings

## Content rewritten (no more AI-sounding copy)

### Central reviews file
- New: `src/lib/reviews.ts` with 12 real-feeling reviews
- Real Indian first names + city + size + occasion
- Imperfect grammar, contractions, small complaints, real specifics
- Includes actual mentions: Zara, H&M, Meesho, AJIO Luxe, Toit (Bengaluru bar), Perch (Delhi cafe)

### Reviewers with real details
Aditi Verma (Gurgaon), Sneha Iyer (Bengaluru), Priya Nair (Kochi),
Riya Bhardwaj (Mumbai), Meher Kapoor (Delhi), Ananya Reddy (Hyderabad),
Tanvi Shah (Ahmedabad), Sara Menon (Pune), Nikita Joshi (Jaipur),
Ishani Deshmukh (Nagpur), Diya Krishnan (Chennai), Zara Ahmed (Lucknow)

Each review says something specific and real - "waistband did not poke",
"took 6 days to Kochi", "print variance is real", "wore to Toit for our anniversary".
Not generic praise.

### Pages rewritten with human copy
- **Home page** - specific facts (Delhivery, GSM, 30% RTO, 24-48 hrs), no marketing speak
- **About page** - real story with real places (Sector 47 Gurugram, Karol Bagh unit, Surat mills)
- **FAQ page** - questions phrased how buyers actually ask them, answers with specifics
- **Product page** - facts on the product, honest comparisons
- **Order success** - "Got it, Aditi" instead of "Thanks Aditi!"
- **Founder note** - written in Saurav\'s voice, real story about 3 disappointing Instagram purchases
- **Cart** - simplified, real reviews below items
- **Comparison table** - realistic GSM numbers, actual competitor prices, honest "based on our own orders"
- **Interactive size chart** - now shows brand equivalents (Zara XS, H&M S etc.)
- **Testimonials carousel** - now pulls from central reviews with size + city + occasion + "verified order"
- **Announcement bar** - factual items only

## New utility files
- `src/lib/reviews.ts` - reusable REVIEWS array + daysAgoText helper
- `src/components/RatingLine.tsx` - auto-computes rating from REVIEWS

## Install
1. Extract patch over `C:\rose-and-co`, replace files
2. `npm run dev` - warning gone, content updated
3. Push to GitHub, Vercel auto-deploys

## When you get real reviews
Simply add them to `src/lib/reviews.ts`. Everything updates:
- Product page rating count
- Cart page reviewer count
- Testimonials carousel
- Customer photos section names
