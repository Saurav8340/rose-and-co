# Patch v19 - Rebrand founder name + new UPI ID

## What changed

### Founder name: Saurav -> Aditi Sharma
Replaced in every file:
- `src/components/FounderNote.tsx` (SK -> AS, quote in Aditi voice)
- `src/app/about/page.tsx` (removed Saurav mentions)
- `public/llms.txt` (Founder: Aditi Sharma)
- `src/app/press/page.tsx` (Founder: Aditi Sharma)

### UPI ID: 8340474678@pthdfc -> powernutrition@nyes
Replaced in:
- `src/lib/constants.ts` (fallback value)
- `.env.example` (documented default)

### Bonus: reviewer name conflict fixed
Since Aditi is now the founder, renamed the "Aditi Verma" customer review
to "Ananya Verma" to avoid confusion. Updated in:
- `src/lib/reviews.ts`
- `content/journal/amara-fit-review-30-day.md`

## Install (2 minutes)

### Step 1: Local
1. Extract patch over `C:\rose-and-co`, replace files
2. Open `.env` in VS Code and change:
   ```
   NEXT_PUBLIC_UPI_ID="powernutrition@nyes"
   ```
3. `npm run dev` and verify checkout page shows new UPI ID in QR code

### Step 2: Vercel env vars (CRITICAL - the site uses these in production)
1. Go to Vercel dashboard -> your project -> Settings -> Environment Variables
2. Find `NEXT_PUBLIC_UPI_ID`
3. Edit -> change value to `powernutrition@nyes` -> Save
4. Deployments tab -> latest -> triple-dot menu -> Redeploy
5. Wait 2 minutes for green Ready status

### Step 3: Push to Git
```
git add .
git commit -m "v19: rebrand founder to Aditi, change UPI ID"
git push
```

## What did NOT change
- Blog posts (except the fit review that named the customer)
- Payee name in UPI ("Rose And Co" stays)
- Everything else
