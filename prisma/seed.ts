// prisma/seed.ts
// ============================================================
// v2 — Amara + Aarna removed. Those products were deleted during
// the site revamp (see MASTER.md design system). Products are now
// created exclusively through the admin panel at /admin/products/new,
// NOT through this file.
//
// Why this file was cleaned instead of just left alone:
// this file used prisma.product.upsert(), which means running it
// (even by accident, e.g. `npm run db:seed`) would have silently
// RECREATED Amara and Aarna in the live database, bringing back
// deleted products. Cleaning it out prevents that.
//
// This file is now a safe no-op. If you want to bootstrap dev/test
// products via seed again in future, add new upsert() blocks below
// following the same pattern as the old Amara/Aarna blocks (kept in
// git history if you ever need to reference the shape).
// ============================================================

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seed file is currently empty on purpose.');
  console.log('Products are created via /admin/products/new, not this script.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
