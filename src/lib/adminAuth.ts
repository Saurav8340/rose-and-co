// src/lib/adminAuth.ts
// Login gate for the product + upload APIs.
// Reuses YOUR existing verifier so it matches your login exactly.
import { verifyAdminSession } from "@/lib/session";

export async function isAdmin(): Promise<boolean> {
  return verifyAdminSession();
}
