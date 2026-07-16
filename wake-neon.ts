import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.$queryRaw`SELECT 1`
  .then(() => { console.log("NEON IS AWAKE"); process.exit(0); })
  .catch((e) => { console.error("STILL UNREACHABLE:", e.message); process.exit(1); });
