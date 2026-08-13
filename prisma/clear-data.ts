// prisma/clear-data.ts
//
// Clears past CUSTOMER DATA while keeping all FEATURES/CODE fully intact.
// Deleting rows here does NOT disable Lead Collector, Waitlist, Referrals,
// or Loyalty — those features keep working normally for all new activity
// starting the moment this script finishes. Only historical rows go.
//
// DELETES (customer data, rows only):
//   - OrderItem, Order        (past customer orders + line items)
//   - Lead                    (past visitor tracking / cart data —
//                              Lead Collector feature itself stays live)
//   - Waitlist                (past restock-alert signups — feature stays live)
//   - Referral                (past referral codes issued — feature stays live)
//   - LoyaltyPoints           (past customer points/tier — feature stays live)
//   - VerificationSession     (expired OTP/captcha tokens, harmless either way)
//   - AdminLog                (your own past admin action history)
//
// KEEPS UNTOUCHED:
//   - Review                  (your product reviews)
//   - Product                 (your product catalog)
//   - BlockedPincode          (delivery blocklist — a business setting,
//                              not customer data)
//   - playing_with_neon       (unrelated Neon default table, left alone)
//
// ── HOW TO RUN ──────────────────────────────────────────────────────────
//   npx tsx prisma/clear-data.ts
// ──────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing past customer data. Features remain fully active for new activity.\n');

  // OrderItem must be deleted before Order (foreign key dependency).
  const orderItems = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${orderItems.count} order item(s).`);

  const orders = await prisma.order.deleteMany({});
  console.log(`Deleted ${orders.count} order(s).`);

  const leads = await prisma.lead.deleteMany({});
  console.log(`Deleted ${leads.count} lead(s). Lead Collector feature is still live.`);

  const waitlist = await prisma.waitlist.deleteMany({});
  console.log(`Deleted ${waitlist.count} waitlist entrie(s). Waitlist feature is still live.`);

  const referrals = await prisma.referral.deleteMany({});
  console.log(`Deleted ${referrals.count} referral code(s). Referral feature is still live.`);

  const loyalty = await prisma.loyaltyPoints.deleteMany({});
  console.log(`Deleted ${loyalty.count} loyalty record(s). Loyalty feature is still live.`);

  const sessions = await prisma.verificationSession.deleteMany({});
  console.log(`Deleted ${sessions.count} verification session(s).`);

  const adminLogs = await prisma.adminLog.deleteMany({});
  console.log(`Deleted ${adminLogs.count} admin log(s).`);

  const reviewCount = await prisma.review.count();
  const productCount = await prisma.product.count();
  const pincodeCount = await prisma.blockedPincode.count();

  console.log('\nDone. Kept fully untouched:');
  console.log(`  Reviews: ${reviewCount}`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Blocked pincodes: ${pincodeCount}`);
  console.log('\nAll features (Lead Collector, Waitlist, Referral, Loyalty) remain');
  console.log('fully functional — only past data was cleared, not the code.');
}

main()
  .catch((e) => {
    console.error('Something went wrong:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
