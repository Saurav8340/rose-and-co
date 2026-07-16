# ============================================================================
#  ROSE & CO - AUDIT FIX PATCH (only the items you listed)
#  Run from project root (folder with package.json).
#  Every file is backed up to <file>.backup before it is touched.
#  Every edit is idempotent: it prints [skip] instead of breaking if the exact
#  text isn't found (e.g. already fixed, or formatting differs).
# ============================================================================

$ErrorActionPreference = "Stop"
function Say($m,$c="White"){ Write-Host $m -ForegroundColor $c }

if (-not (Test-Path "package.json")) { Say "ERROR: run from project root (where package.json is)." Red; exit 1 }

function BackupOnce($path){
  if ((Test-Path -LiteralPath $path) -and -not (Test-Path -LiteralPath "$path.backup")) {
    Copy-Item -LiteralPath $path -Destination "$path.backup" -Force
  }
}
function PatchFile($path,$find,$replace,$label){
  if (-not (Test-Path -LiteralPath $path)) { Say "  [warn] $path not found - skipped ($label)" Red; return }
  BackupOnce $path
  $t = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $path))
  if ($t.Contains($find)) {
    $t = $t.Replace($find,$replace)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $path), $t)
    Say "  [ok] $label" Green
  } else {
    Say "  [skip] $label (text not found / already done)" DarkYellow
  }
}
function WriteFile($path,$content){
  BackupOnce $path
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { [System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) $dir)) | Out-Null }
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) $path), $content)
  Say "  [ok] wrote $path" Green
}
function DeleteWithBackup($path,$label){
  if (Test-Path -LiteralPath $path) {
    BackupOnce $path
    Remove-Item -LiteralPath $path -Force
    Say "  [ok] deleted $path (backup kept as $path.backup)" Green
  } else { Say "  [skip] $label ($path not present)" DarkYellow }
}

Say "=== ROSE & CO audit-fix starting ===" Cyan

# ---------------------------------------------------------------------------
Say "#1  COD math + stale comment (src/lib/constants.ts)" Yellow
# ---------------------------------------------------------------------------
$C = "src/lib/constants.ts"
PatchFile $C '1701' '2000' "#1 codRemaining 1701 -> 2000"
PatchFile $C '// Selling / COD: Rs 2,000' '// Selling / COD: Rs 2,299' "#1 comment: selling price"
PatchFile $C '// UPI prepaid: Rs 1,900 (Rs 100 off selling)' '// UPI prepaid: Rs 2,199 (Rs 100 off selling)' "#1 comment: UPI price"
PatchFile $C '// Partial COD: Rs 299 online + Rs 1,701 cash = Rs 2,000' '// Partial COD: Rs 299 online + Rs 2,000 cash = Rs 2,299' "#1 comment: partial COD"

# ---------------------------------------------------------------------------
Say "#2  Lock the two CSV export routes + delete public debug route" Yellow
# ---------------------------------------------------------------------------
foreach ($f in @("src/app/api/admin/leads/export/route.ts","src/app/admin/export/route.ts")) {
  PatchFile $f 'import { PrismaClient } from "@prisma/client";' 'import { prisma } from "@/lib/prisma"; import { verifyAdminSession } from "@/lib/session";' "#2 $f prisma singleton + auth import"
  PatchFile $f 'const prisma = new PrismaClient();' '' "#2 $f remove new PrismaClient()"
  PatchFile $f 'export async function GET(req: NextRequest) {' "export async function GET(req: NextRequest) { if (!(await verifyAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });" "#2 $f auth guard"
}
DeleteWithBackup "src/app/api/leads/debug/route.ts" "#2 debug route"

# ---------------------------------------------------------------------------
Say "#3(b)  Remove the false 'Auto-applied at checkout' promise" Yellow
# ---------------------------------------------------------------------------
foreach ($f in @("src/components/PersonalizedDiscount.tsx","src/components/LeadCaptureChip.tsx")) {
  PatchFile $f 'Auto-applied at checkout.' 'Save it for your next order.' "#3 $f wording (with period)"
  PatchFile $f 'Auto-applied at checkout' 'Save it for your next order' "#3 $f wording"
}

# ---------------------------------------------------------------------------
Say "#5  Cart badge reads the correct localStorage key" Yellow
# ---------------------------------------------------------------------------
PatchFile "src/components/HeaderCart.tsx" "getItem('cart')" "getItem('rc_cart_v1')" "#5 HeaderCart key cart -> rc_cart_v1"

# ---------------------------------------------------------------------------
Say "#6  Order-success reads the correct query param (?id=)" Yellow
# ---------------------------------------------------------------------------
PatchFile "src/app/order-success/page.tsx" 'searchParams.order' 'searchParams.id' "#6 param value"
PatchFile "src/app/order-success/page.tsx" '{ order?: string }' '{ id?: string }' "#6 param type"

# ---------------------------------------------------------------------------
Say "#8  PDP price comes from the DB, not the constant" Yellow
# ---------------------------------------------------------------------------
$PC = "src/app/product/[slug]/ProductClient.tsx"
PatchFile $PC 'const displayPrice = PAYMENT.fullPrice;' 'const displayPrice = product.price;' "#8 displayPrice -> product.price"
PatchFile $PC 'const prepaidPrice = PAYMENT.prepaidPrice;' 'const prepaidPrice = product.price - PAYMENT.prepaidSavings;' "#8 prepaidPrice -> product-based"

# ---------------------------------------------------------------------------
Say "#9  Purge stale prices in policies + product metadata" Yellow
# ---------------------------------------------------------------------------
# Product metadata / FAQ (src/app/product/[slug]/page.tsx)
$PP = "src/app/product/[slug]/page.tsx"
PatchFile $PP 'UPI prepaid Rs 1,900 (save Rs 100). COD available (Rs 299 online + rest on delivery).' 'UPI prepaid Rs 2,199 (save Rs 100). COD available (Rs 299 online + rest on delivery).' "#9 metadata description"
PatchFile $PP 'Prepaid via UPI is Rs 1,900 (save Rs 100). Partial COD is Rs 2,000 total, split as Rs 299 online plus Rs 1,701 cash on delivery.' 'Prepaid via UPI is Rs 2,199 (save Rs 100). Partial COD is Rs 2,299 total, split as Rs 299 online plus Rs 2,000 cash on delivery.' "#9 FAQ prepaid/COD"
# Terms  (finds avoid the leading currency symbol on purpose)
PatchFile "src/app/terms/page.tsx" '1,499 all-in' '2,299 all-in' "#9 terms all-in"
PatchFile "src/app/terms/page.tsx" '1,499 upfront' '2,199 upfront' "#9 terms prepaid"
PatchFile "src/app/terms/page.tsx" '300 online + ' '299 online + ' "#9 terms partial COD (deposit)"
PatchFile "src/app/terms/page.tsx" '1,199 in cash' '2,000 in cash' "#9 terms partial COD (balance)"
# Refund
PatchFile "src/app/refund-policy/page.tsx" '300 online + ' '299 online + ' "#9 refund deposit"
PatchFile "src/app/refund-policy/page.tsx" '1,199 on delivery' '2,000 on delivery' "#9 refund balance"
PatchFile "src/app/refund-policy/page.tsx" '300 lands back in your UPI' '299 lands back in your UPI' "#9 refund UPI line"
PatchFile "src/app/refund-policy/page.tsx" '1,199 is refunded to a bank account' '2,000 is refunded to a bank account' "#9 refund bank line"
# Shipping
PatchFile "src/app/shipping-policy/page.tsx" '300 collected online at checkout' '299 collected online at checkout' "#9 shipping deposit"
PatchFile "src/app/shipping-policy/page.tsx" '1,199 collected in cash when the courier hands over the package' '2,000 collected in cash when the courier hands over the package' "#9 shipping balance"

# ---------------------------------------------------------------------------
Say "#10  Make the Meta pixel track() actually fire (wiring still needed)" Yellow
# ---------------------------------------------------------------------------
$PIXEL = @'
'use client';

declare global {
  interface Window { fbq: any; _fbq: any; }
}

export function pageview() {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'PageView');
}

// Now functional. Call this from components to fire mid-funnel events, e.g.:
//   track('ViewContent', { content_ids: [id], value, currency: 'INR' })
//   track('AddToCart',   { content_ids: [id], value, currency: 'INR' })
//   track('InitiateCheckout', { value, currency: 'INR' })
export function track(event: string, data?: Record<string, any>, eventId?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  const opts = eventId ? { eventID: eventId } : undefined;
  window.fbq('track', event, data || {}, opts);
}

export function generateEventId() {
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
'@
WriteFile "src/lib/pixel.ts" $PIXEL

# ---------------------------------------------------------------------------
Say "Profit lever: sitemap includes journal posts + collections" Yellow
# ---------------------------------------------------------------------------
$SITEMAP = @'
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAllPosts } from '@/lib/journal';

const DOMAIN = 'https://rose-and-co.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${DOMAIN}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const posts = getAllPosts();
  const postUrls = posts.map((post) => ({
    url: `${DOMAIN}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const collections = ['co-ord-sets', 'satin-skirts', 'party-wear', 'engagement-outfits'].map((slug) => ({
    url: `${DOMAIN}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticPages = [
    { url: DOMAIN, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${DOMAIN}/shop`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${DOMAIN}/journal`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${DOMAIN}/faq`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/about`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/size-guide`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/fabric-guide`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${DOMAIN}/care-guide`, priority: 0.5, changeFrequency: 'monthly' as const },
  ].map((s) => ({ ...s, lastModified: new Date() }));

  return [...staticPages, ...collections, ...productUrls, ...postUrls];
}
'@
WriteFile "src/app/sitemap.ts" $SITEMAP

# ---------------------------------------------------------------------------
Say "Profit lever: create public/llms.txt (was 404)" Yellow
# ---------------------------------------------------------------------------
$LLMS = @'
# Rose & Co
Small-batch, hand-painted marble swirl satin co-ord sets. Ships from Gurugram, India in 24-48 hours. Free shipping across India, 7-day returns.

## Products
- Amara Marble Swirl Co-ord Set: https://rose-and-co.vercel.app/product/amara-marble-swirl-coord-set
- Aarna Beige Marble Swirl Co-ord Set: https://rose-and-co.vercel.app/product/aarna-beige-marble-swirl-coord-set

## Key pages
- Shop: https://rose-and-co.vercel.app/shop
- Journal (guides on satin, GSM, styling): https://rose-and-co.vercel.app/journal
- FAQ: https://rose-and-co.vercel.app/faq

## Contact
- Email: care@roseandco.in
'@
WriteFile "public/llms.txt" $LLMS

# ---------------------------------------------------------------------------
Say "Profit lever: delete dead/duplicate code (backups kept)" Yellow
# ---------------------------------------------------------------------------
DeleteWithBackup "src/checkout/page.tsx" "stray duplicate checkout"
DeleteWithBackup "src/components/CheckoutSummary.tsx" "unused CheckoutSummary"

Say "" 
Say "=========================================================" Cyan
Say " DONE. Backups saved as <file>.backup next to each file." Cyan
Say "=========================================================" Cyan
Say " Verify locally:  npm run dev   then   npm run build" White
Say " If build errors mention CheckoutSummary, restore it:" White
Say "   Copy-Item src/components/CheckoutSummary.tsx.backup src/components/CheckoutSummary.tsx" DarkGray
Say "" 
Say " NOT changed by this patch (need a manual step - see notes):" White
Say "  #7 PDP description, #10 pixel call-wiring, #3(a) full coupon logic," White
Say "  bundle upsell, 28 journal posts, WhatsApp/UPI/email placeholders." White
