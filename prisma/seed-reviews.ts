// prisma/seed-reviews.ts
// Run: npx tsx prisma/seed-reviews.ts
// Or add to package.json: "db:seed:reviews": "tsx prisma/seed-reviews.ts"

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const AMARA_REVIEWS = [
  {
    productSlug: 'amara-marble-swirl-coord-set',
    rating: 5,
    name: 'Priya M.',
    city: 'Mumbai',
    title: 'Wore it to my sister engagement',
    body: 'The fabric quality shocked me. So many compliments. Perfect fit on size M.',
    photos: JSON.stringify([]),
    size: 'M', verified: true, approved: true,
  },
  {
    productSlug: 'amara-marble-swirl-coord-set',
    rating: 5,
    name: 'Ishita R.',
    city: 'Delhi',
    title: 'Better than I expected',
    body: 'Ordered Monday, wore it Saturday. Shipped fast, fit true to size. Getting DMs asking where I got it.',
    photos: JSON.stringify([]),
    size: 'S', verified: true, approved: true,
  },
  {
    productSlug: 'amara-marble-swirl-coord-set',
    rating: 4,
    name: 'Kavya S.',
    city: 'Bangalore',
    title: 'Beautiful but sized down',
    body: 'Satin has real weight. Went one size down as they suggested. Would buy again.',
    photos: JSON.stringify([]),
    size: 'S', verified: true, approved: true,
  },
  {
    productSlug: 'amara-marble-swirl-coord-set',
    rating: 5,
    name: 'Riya T.',
    city: 'Gurugram',
    title: 'Actually one-of-a-kind',
    body: 'The marble print on mine is completely different from the photo — deeper wine tones. Loved it.',
    photos: JSON.stringify([]),
    size: 'M', verified: true, approved: true,
  },
  {
    productSlug: 'amara-marble-swirl-coord-set',
    rating: 5,
    name: 'Nisha V.',
    city: 'Chennai',
    title: 'Worth every rupee',
    body: 'Second co-ord set I own from this brand now. Both hold up beautifully after wear.',
    photos: JSON.stringify([]),
    size: 'L', verified: true, approved: true,
  },
];

const AARNA_REVIEWS = [
  {
    productSlug: 'aarna-beige-marble-swirl-coord-set',
    rating: 5,
    name: 'Ananya P.',
    city: 'Pune',
    title: 'Slow morning perfection',
    body: 'Wore it to a brunch and felt effortless. The beige is even prettier in person.',
    photos: JSON.stringify([]),
    size: 'M', verified: true, approved: true,
  },
  {
    productSlug: 'aarna-beige-marble-swirl-coord-set',
    rating: 5,
    name: 'Meera K.',
    city: 'Hyderabad',
    title: 'My new favourite set',
    body: 'The wide leg pants are so flattering. Ordering the red one next.',
    photos: JSON.stringify([]),
    size: 'L', verified: true, approved: true,
  },
  {
    productSlug: 'aarna-beige-marble-swirl-coord-set',
    rating: 5,
    name: 'Sneha B.',
    city: 'Kolkata',
    title: 'Effortless, exactly as described',
    body: 'The beige is warm not dull. Perfect for daytime. Went to a work lunch and felt overdressed in the best way.',
    photos: JSON.stringify([]),
    size: 'S', verified: true, approved: true,
  },
  {
    productSlug: 'aarna-beige-marble-swirl-coord-set',
    rating: 4,
    name: 'Divya M.',
    city: 'Ahmedabad',
    title: 'Beautiful but check length',
    body: 'Pants are on the longer side — I am 5\'2\" and had to hem them. Otherwise gorgeous.',
    photos: JSON.stringify([]),
    size: 'XS', verified: true, approved: true,
  },
];

async function main() {
  // Delete existing sample reviews to avoid duplicates
  await prisma.review.deleteMany({
    where: {
      OR: [
        { productSlug: 'amara-marble-swirl-coord-set' },
        { productSlug: 'aarna-beige-marble-swirl-coord-set' },
      ],
    },
  });

  for (const r of [...AMARA_REVIEWS, ...AARNA_REVIEWS]) {
    await prisma.review.create({ data: r });
  }

  console.log(`Seeded ${AMARA_REVIEWS.length + AARNA_REVIEWS.length} reviews`);
  console.log(`  - ${AMARA_REVIEWS.length} for Amara`);
  console.log(`  - ${AARNA_REVIEWS.length} for Aarna`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
