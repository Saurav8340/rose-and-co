// prisma/delete-old-products.ts
//
// Deletes the two old products (Amara + Aarna) and everything tied to them:
//   1. Reviews left on those products
//   2. The products themselves
//
// It will NOT touch real customer order history unless you explicitly
// confirm it (see below), because deleting order items would erase your
// actual sales records for those products.
//
// ── HOW TO RUN ──────────────────────────────────────────────────────────
// 1. Save this file as:  prisma/delete-old-products.ts
// 2. In your VS Code terminal, run:
//
//      npx tsx prisma/delete-old-products.ts
//
// 3. If it says real orders reference these products and stops, and you
//    are SURE you want to erase that order history too, run instead:
//
//      CONFIRM_DELETE_ORDERS=true npx tsx prisma/delete-old-products.ts
//
// ──────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLD_SLUGS = [
  'amara-marble-swirl-coord-set',
  'aarna-beige-marble-swirl-coord-set',
];

async function main() {
  console.log('Looking up old products...');

  const products = await prisma.product.findMany({
    where: { slug: { in: OLD_SLUGS } },
  });

  if (products.length === 0) {
    console.log('No matching products found in the database. Nothing to delete.');
    return;
  }

  const productIds = products.map((p) => p.id);
  console.log(
    `Found ${products.length} product(s): ${products.map((p) => p.name).join(', ')}`
  );

  // 1. Delete reviews tied to these products (Review is matched by slug, not id)
  const deletedReviews = await prisma.review.deleteMany({
    where: { productSlug: { in: OLD_SLUGS } },
  });
  console.log(`Deleted ${deletedReviews.count} review(s).`);

  // 2. Check whether any REAL orders reference these products
  const orderItemCount = await prisma.orderItem.count({
    where: { productId: { in: productIds } },
  });

  if (orderItemCount > 0) {
    console.log(`Found ${orderItemCount} order item(s) referencing these products.`);

    if (process.env.CONFIRM_DELETE_ORDERS === 'true') {
      const deletedItems = await prisma.orderItem.deleteMany({
        where: { productId: { in: productIds } },
      });
      console.log(
        `Deleted ${deletedItems.count} order item(s) — CONFIRM_DELETE_ORDERS was set.`
      );
    } else {
      console.log('');
      console.log('⚠️  These order items belong to REAL customer orders.');
      console.log('    Stopping here to protect your sales history.');
      console.log('    Products were NOT deleted.');
      console.log('');
      console.log('    If you are SURE you want to erase that order history too, run:');
      console.log('      CONFIRM_DELETE_ORDERS=true npx tsx prisma/delete-old-products.ts');
      console.log('');
      return;
    }
  }

  // 3. Delete the products themselves
  const deletedProducts = await prisma.product.deleteMany({
    where: { slug: { in: OLD_SLUGS } },
  });
  console.log(`Deleted ${deletedProducts.count} product(s). Done — database is clean.`);
}

main()
  .catch((e) => {
    console.error('Something went wrong:', e);
    console.error('');
    console.error('If the error mentions a field name (like "productId" or "productSlug"),');
    console.error('your Prisma schema might use slightly different field names. Paste me');
    console.error('the contents of prisma/schema.prisma and I will fix this script.');
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
