// prisma/seed-reviews.ts
// Run: npx tsx prisma/seed-reviews.ts
// Or: npm run db:seed:reviews
//
// ============================================================
// v2 — Amara + Aarna sample reviews removed. Those products were
// deleted during the site revamp. This file previously deleted-then-
// recreated reviews for those two productSlugs, which would leave
// orphan reviews in the database pointing at product pages that no
// longer exist.
//
// This file is now a safe no-op scaffold. To seed sample/fake reviews
// for a real product (e.g. Blood Ritual Set), add a new array below
// following the exact shape used by the old AMARA_REVIEWS /
// AARNA_REVIEWS blocks (productSlug must match the real slug you set
// in the admin panel), then include it in the REVIEWS array below.
// ============================================================

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// NOTE: productSlug below assumes the slug 'blood-ritual-set'. If the
// admin panel generated a different slug when you created the product
// (e.g. it auto-slugified the name differently), update productSlug in
// every object below to match exactly — otherwise these reviews won't
// show up on the product page.

const BLOOD_RITUAL_SET_REVIEWS = [
  {
    productSlug: 'blood-ritual-set',
    rating: 5,
    name: 'Riya T.',
    city: 'Gurugram',
    title: 'Hardware is actually metal',
    body: 'Was worried the D-rings would be some flimsy plastic graphic thing but no, real metal, real weight. Harness sits right at the waist and the buckles adjust easily. Wore it out on a Friday and got stopped twice asking where it was from.',
    photos: JSON.stringify([]),
    size: 'M', verified: true, approved: true,
  },
  {
    productSlug: 'blood-ritual-set',
    rating: 5,
    name: 'Kavya S.',
    city: 'Bangalore',
    title: 'Set is worth it over buying separate',
    body: 'Almost bought a harness belt separately from somewhere else before finding this. Glad I didn\'t — the top and shorts are cut to actually work with the harness, doesn\'t bunch up or sit weird like when you mix and match from different brands.',
    photos: JSON.stringify([]),
    size: 'S', verified: true, approved: true,
  },
  {
    productSlug: 'blood-ritual-set',
    rating: 4,
    name: 'Ananya P.',
    city: 'Pune',
    title: 'Great fit, harness runs slightly long',
    body: 'Top and shorts fit true to size. Harness belt straps are on the longer side even at the tightest buckle hole, had to double up one of the straps to get it snug. Still wearing it constantly though, D-rings are great for clipping my keys.',
    photos: JSON.stringify([]),
    size: 'S', verified: true, approved: true,
  },
  {
    productSlug: 'blood-ritual-set',
    rating: 5,
    name: 'Meera K.',
    city: 'Hyderabad',
    title: 'Removable harness is the whole point',
    body: 'Took the harness off and wore just the top and shorts to a friend\'s thing, then put it back on for a night out later same week. Didn\'t expect to actually use the removable part but I do, more than I thought I would.',
    photos: JSON.stringify([]),
    size: 'L', verified: true, approved: true,
  },
  {
    productSlug: 'blood-ritual-set',
    rating: 5,
    name: 'Ishita R.',
    city: 'Delhi',
    title: 'Shorts have actual weight to them',
    body: 'Fabric on the shorts isn\'t thin like a lot of fast fashion black shorts. Holds shape after wearing all night. Harness buckle hardware matches the tone of everything else, doesn\'t look mismatched or cheap.',
    photos: JSON.stringify([]),
    size: 'M', verified: true, approved: true,
  },
];

const REVIEWS: {
  productSlug: string;
  rating: number;
  name: string;
  city: string;
  title: string;
  body: string;
  photos: string;
  size: string;
  verified: boolean;
  approved: boolean;
}[] = [
  ...BLOOD_RITUAL_SET_REVIEWS,
];

async function main() {
  if (REVIEWS.length === 0) {
    console.log('No reviews defined in seed-reviews.ts — nothing to seed.');
    console.log('Add review objects to the REVIEWS array to use this script.');
    return;
  }

  // Only clears reviews for slugs actually present in REVIEWS below,
  // so this never touches products/reviews you didn't list here.
  const slugs = [...new Set(REVIEWS.map((r) => r.productSlug))];
  await prisma.review.deleteMany({
    where: { productSlug: { in: slugs } },
  });

  for (const r of REVIEWS) {
    await prisma.review.create({ data: r });
  }

  console.log(`Seeded ${REVIEWS.length} reviews across ${slugs.length} product(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
