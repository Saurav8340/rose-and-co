// prisma/fix-prices.ts
// Auto-fixes the CHARGED price in your database for every product.
// Run with:  npx tsx prisma/fix-prices.ts
// (You already have tsx installed â€” your package.json uses it for db:seed.)
//
// Change these two numbers if your prices differ.
const SELLING_PRICE = 2299; // what they pay
const COMPARE_AT = 2999;    // strike-through MRP

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} product(s). Updatingâ€¦`);

  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { price: SELLING_PRICE, compareAt: COMPARE_AT },
    });
    console.log(`  âœ“ ${p.name}: price=${SELLING_PRICE}, compareAt=${COMPARE_AT}`);
  }

  console.log("Done. Every product now charges â‚¹" + SELLING_PRICE + ".");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());