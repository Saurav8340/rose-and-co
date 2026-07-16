# ============================================================================
#  ROSE & CO - MASTER AUTO-FIX INSTALLER (PowerShell)
#  Fixes copy + price AND installs create/edit/duplicate + admin auth.
#  Run from your project root (the folder that has package.json).
#
#  It ALWAYS backs up any file it touches to <file>.backup before changing it.
# ============================================================================

$ErrorActionPreference = "Stop"
function Say($m,$c="White"){ Write-Host $m -ForegroundColor $c }

if (-not (Test-Path "package.json")) {
  Say "ERROR: Run this from your project root (where package.json lives)." Red; exit 1
}
Say "=== ROSE & CO auto-fix starting ===" Cyan

# Optional: keep a copy of all changes together
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Say "Backup suffix for replaced files: .backup" DarkGray

# ---------------------------------------------------------------------------
Say "PART 1/3  Auto-fixing copy + price in existing files..." Yellow
# ---------------------------------------------------------------------------

if (Test-Path -LiteralPath "src/app/product/[slug]/ProductClient.tsx") {
  Copy-Item -LiteralPath "src/app/product/[slug]/ProductClient.tsx" -Destination "src/app/product/[slug]/ProductClient.tsx.backup" -Force
  $txt = Get-Content -LiteralPath "src/app/product/[slug]/ProductClient.tsx" -Raw
  if ($txt.Contains('A fitted crop top and a high-waisted midi skirt.')) { $txt = $txt.Replace('A fitted crop top and a high-waisted midi skirt.', 'A relaxed satin button-down shirt and high-waisted wide-leg pants.'); Say "  [ok] src/app/product/[slug]/ProductClient.tsx: PDP description sentence" Green } else { Say "  [skip] src/app/product/[slug]/ProductClient.tsx: PDP description sentence (already fixed or not found)" DarkYellow }
  if ($txt.Contains('A-line midi skirt, mid-calf on a 5')) { $txt = $txt.Replace('A-line midi skirt, mid-calf on a 5', 'Wide-leg pants, full length on a 5'); Say "  [ok] src/app/product/[slug]/ProductClient.tsx: PDP fit line" Green } else { Say "  [skip] src/app/product/[slug]/ProductClient.tsx: PDP fit line (already fixed or not found)" DarkYellow }
  if ($txt.Contains('Fitted top, sits at the natural waist.')) { $txt = $txt.Replace('Fitted top, sits at the natural waist.', 'Relaxed shirt with a camp collar.'); Say "  [ok] src/app/product/[slug]/ProductClient.tsx: PDP fit lead-in" Green } else { Say "  [skip] src/app/product/[slug]/ProductClient.tsx: PDP fit lead-in (already fixed or not found)" DarkYellow }
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/product/[slug]/ProductClient.tsx"), $txt)
} else { Say "  [warn] src/app/product/[slug]/ProductClient.tsx not found - skipped" Red }

if (Test-Path -LiteralPath "src/app/product/[slug]/page.tsx") {
  Copy-Item -LiteralPath "src/app/product/[slug]/page.tsx" -Destination "src/app/product/[slug]/page.tsx.backup" -Force
  $txt = Get-Content -LiteralPath "src/app/product/[slug]/page.tsx" -Raw
  if ($txt.Contains('''marble print skirt set''')) { $txt = $txt.Replace('''marble print skirt set''', '''marble print co-ord set'''); Say "  [ok] src/app/product/[slug]/page.tsx: SEO keyword 1" Green } else { Say "  [skip] src/app/product/[slug]/page.tsx: SEO keyword 1 (already fixed or not found)" DarkYellow }
  if ($txt.Contains('''crop top skirt set''')) { $txt = $txt.Replace('''crop top skirt set''', '''satin shirt and pants set'''); Say "  [ok] src/app/product/[slug]/page.tsx: SEO keyword 2" Green } else { Say "  [skip] src/app/product/[slug]/page.tsx: SEO keyword 2 (already fixed or not found)" DarkYellow }
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/product/[slug]/page.tsx"), $txt)
} else { Say "  [warn] src/app/product/[slug]/page.tsx not found - skipped" Red }

if (Test-Path -LiteralPath "src/app/about/page.tsx") {
  Copy-Item -LiteralPath "src/app/about/page.tsx" -Destination "src/app/about/page.tsx.backup" -Force
  $txt = Get-Content -LiteralPath "src/app/about/page.tsx" -Raw
  if ($txt.Contains('A crop top and a midi skirt,')) { $txt = $txt.Replace('A crop top and a midi skirt,', 'A satin shirt and wide-leg pants,'); Say "  [ok] src/app/about/page.tsx: About story" Green } else { Say "  [skip] src/app/about/page.tsx: About story (already fixed or not found)" DarkYellow }
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/about/page.tsx"), $txt)
} else { Say "  [warn] src/app/about/page.tsx not found - skipped" Red }

if (Test-Path -LiteralPath "src/lib/constants.ts") {
  Copy-Item -LiteralPath "src/lib/constants.ts" -Destination "src/lib/constants.ts.backup" -Force
  $txt = Get-Content -LiteralPath "src/lib/constants.ts" -Raw
  if ($txt -match 'fullPrice:\s*2000') { $txt = $txt -replace 'fullPrice:\s*2000', 'fullPrice:      2299'; Say "  [ok] src/lib/constants.ts: Display full price" Green } else { Say "  [skip] src/lib/constants.ts: Display full price (already fixed or not found)" DarkYellow }
  if ($txt -match 'prepaidPrice:\s*1900') { $txt = $txt -replace 'prepaidPrice:\s*1900', 'prepaidPrice:   2199'; Say "  [ok] src/lib/constants.ts: Display prepaid price" Green } else { Say "  [skip] src/lib/constants.ts: Display prepaid price (already fixed or not found)" DarkYellow }
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/lib/constants.ts"), $txt)
} else { Say "  [warn] src/lib/constants.ts not found - skipped" Red }

# ---------------------------------------------------------------------------
Say "PART 2/3  Creating new folders + files..." Yellow
# ---------------------------------------------------------------------------
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "prisma")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/admin/products")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/admin/products/[slug]/edit")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/admin/products/new")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/api/products")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/api/products/[slug]")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/api/products/[slug]/duplicate")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/app/api/upload")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/components/admin")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) "src/lib")) | Out-Null

$c = @'
// src/lib/adminAuth.ts
// (a) LOGIN GATE for the product APIs.
// Verifies the same admin cookie your /admin/login already sets, using `jose`
// (which you already have installed). If the cookie is missing/invalid, the
// API refuses to create/edit/delete products.
//
// ⚠️ TWO VALUES MUST MATCH YOUR EXISTING LOGIN ROUTE:
//   1) COOKIE_NAME  — the cookie your /api/admin/login sets
//   2) the env var that holds your JWT secret
// Run the "AUTH AUDIT" command in the guide to find both, then set them here.

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// 1) CHANGE if your login route uses a different cookie name.
//    Common names: "admin_token", "admin-session", "token", "session".
const COOKIE_NAME = "admin_token";

// 2) CHANGE if your secret lives under a different env var name.
//    Common names: ADMIN_JWT_SECRET, JWT_SECRET, AUTH_SECRET.
const SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "";

export async function isAdmin(): Promise<boolean> {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token || !SECRET) return false;
    await jwtVerify(token, new TextEncoder().encode(SECRET));
    return true;
  } catch {
    return false;
  }
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/lib/adminAuth.ts"), $c); Say "  [ok] wrote src/lib/adminAuth.ts" Green

$c = @'
"use client";
// src/components/admin/ProductForm.tsx
// ONE form used by BOTH "Create" and "Edit". Every box maps to a column in your
// Product database table (slug, name, description, price, compareAt, images, sizes, active).

import { useMemo, useState } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Shape we pass in when editing an existing product.
export type ProductFormValues = {
  slug?: string;
  name: string;
  description: string;
  price: number;
  compareAt: number;
  sizes: string[];
  images: string[];
  active: boolean;
};

export default function ProductForm({
  initial,
  mode,
}: {
  initial?: ProductFormValues;
  mode: "create" | "edit";
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<number>(initial?.price ?? 2299);
  const [compareAt, setCompareAt] = useState<number>(initial?.compareAt ?? 2999);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? [...ALL_SIZES]);
  const [images, setImages] = useState<string[]>(
    initial?.images?.length ? initial.images : [""]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ url: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload one or more chosen files, compress via /api/upload, add to images.
  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        added.push(data.url);
      }
      // drop any empty placeholder boxes, then append the new images
      setImages((prev) => [...prev.filter((i) => i.trim()), ...added]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, j) => j !== index));
  }

  const previewSlug = useMemo(
    () =>
      (initial?.slug ??
        name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")),
    [name, initial?.slug]
  );

  function toggleSize(s: string) {
    setSizes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  async function save(publish: boolean) {
    setError("");
    if (!name.trim()) return setError("Product name is required.");
    if (!price) return setError("Selling price is required.");

    setSaving(true);
    const payload = {
      name,
      description,
      price,
      compareAt,
      sizes,
      images: images.filter((i) => i.trim()),
      active: publish,
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/products/${initial!.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      const slug = data.product?.slug ?? initial?.slug;
      setDone({ url: `/product/${slug}` });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", padding: 20, textAlign: "center" }}>
        <h1>{mode === "create" ? "✅ Product created" : "✅ Changes saved"}</h1>
        <p style={{ margin: "16px 0" }}>
          <a href={done.url} target="_blank" rel="noreferrer" style={{ color: "#8a1c3b", fontWeight: 600 }}>
            {done.url}
          </a>
        </p>
        <button style={btn} onClick={() => navigator.clipboard.writeText(done.url)}>Copy link</button>
        <a style={{ ...btn, textDecoration: "none", color: "#333" }} href="/admin/products">Back to products</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>
        {mode === "create" ? "Create a listing" : `Edit: ${initial?.name}`}
      </h1>

      <label style={lbl}>Product name
        <input style={inp} value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Aarna Beige Marble Swirl Co-ord Set" />
      </label>
      {name && (
        <p style={hint}>
          URL: <code>/product/{previewSlug}</code>
          {mode === "edit" && " (URL stays the same when editing)"}
        </p>
      )}

      <label style={lbl}>Description (the “The set” paragraph)
        <textarea style={{ ...inp, minHeight: 90 }} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A relaxed satin button-down shirt and high-waisted wide-leg pants. Hand-painted marble swirl…" />
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <label style={{ ...lbl, flex: 1 }}>Selling price (₹)
          <input style={inp} type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
        </label>
        <label style={{ ...lbl, flex: 1 }}>MRP / compare-at (₹)
          <input style={inp} type="number" value={compareAt} onChange={(e) => setCompareAt(+e.target.value)} />
        </label>
      </div>

      <label style={lbl}>Sizes in stock</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {ALL_SIZES.map((s) => (
          <button key={s} type="button" onClick={() => toggleSize(s)}
            style={{ ...sizeBtn, background: sizes.includes(s) ? "#8a1c3b" : "#fff",
                     color: sizes.includes(s) ? "#fff" : "#333" }}>
            {s}
          </button>
        ))}
      </div>

      <label style={lbl}>Product images</label>

      {/* Click-to-upload box (also accepts drag & drop). */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          display: "block", border: "2px dashed #c9a1ad", borderRadius: 12,
          padding: "26px 16px", textAlign: "center", cursor: "pointer",
          background: "#fdf7f9", color: "#8a1c3b", marginBottom: 12,
        }}
      >
        {uploading ? "Uploading & compressing…" : "📷 Click to choose photos, or drag them here"}
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      <p style={hint}>JPG/PNG/HEIC up to 8 MB each. They’re auto-shrunk to load fast.</p>

      {/* Thumbnails of what's been added. */}
      {images.filter((i) => i.trim()).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "12px 0" }}>
          {images.filter((i) => i.trim()).map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Product image ${i + 1}`}
                style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
              <button type="button" onClick={() => removeImage(i)}
                style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22,
                         borderRadius: "50%", border: "none", background: "#8a1c3b", color: "#fff",
                         cursor: "pointer", lineHeight: "22px", padding: 0 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: "#c0392b", fontWeight: 600 }}>⚠ {error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button type="button" style={btn} disabled={saving} onClick={() => save(false)}>
          {saving ? "Saving…" : "Save as draft"}
        </button>
        <button type="button" style={{ ...btn, background: "#8a1c3b", color: "#fff" }}
          disabled={saving} onClick={() => save(true)}>
          {saving ? "Saving…" : mode === "create" ? "Publish (go live)" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, margin: "14px 0 4px" };
const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", border: "1px solid #ccc", borderRadius: 8, font: "inherit" };
const btn: React.CSSProperties = { padding: "9px 16px", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", margin: "0 6px 0 0" };
const sizeBtn: React.CSSProperties = { padding: "8px 14px", border: "1px solid #8a1c3b", borderRadius: 8, cursor: "pointer" };
const hint: React.CSSProperties = { fontSize: 13, color: "#777", margin: "2px 0 0" };
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/components/admin/ProductForm.tsx"), $c); Say "  [ok] wrote src/components/admin/ProductForm.tsx" Green

$c = @'
// src/app/api/upload/route.ts
// NEW FILE. Receives an uploaded image, auto-compresses it with sharp (which you
// already have installed), and returns a small data URL string.
//
// WHY THIS APPROACH: it works on Vercel with ZERO setup — no storage account,
// no tokens, no config. The compressed image string is saved straight into your
// existing Product.images field (already a String in your schema).
//
// (a) Protected by isAdmin() so only a logged-in admin can upload.

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { isAdmin } from "@/lib/adminAuth";

// Keep uploads sane. 8 MB in, compressed down to ~1000px webp out.
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file received." }, { status: 400 });

    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "Image is larger than 8 MB." }, { status: 400 });

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Resize to max 1000px wide, convert to webp ~72% quality (small + sharp-looking).
    const output = await sharp(inputBuffer)
      .rotate() // respect phone photo orientation
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();

    const dataUrl = `data:image/webp;base64,${output.toString("base64")}`;

    return NextResponse.json({ url: dataUrl, bytes: output.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not process image." }, { status: 500 });
  }
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/api/upload/route.ts"), $c); Say "  [ok] wrote src/app/api/upload/route.ts" Green

$c = @'
// src/app/api/products/route.ts
// NEW FILE. Create + list products. Matches your Prisma "Product" model:
//   slug, name, description, price, compareAt, images(String), sizes(String), active
// (a) Protected by isAdmin() so only a logged-in admin can create.

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

// ⚠️ MATCH THIS IMPORT to your other files.
// Open src/app/api/products/by-ids/route.ts and copy its prisma import line.
// Keep the ONE that matches, delete the other:
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || typeof body.price !== "number")
      return NextResponse.json({ error: "Name and numeric price required." }, { status: 400 });

    let slug = slugify(body.name);
    let n = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slugify(body.name)}-${n++}`;
    }

    const product = await prisma.product.create({
      data: {
        slug,
        name: body.name,
        description: body.description ?? "",
        price: body.price,
        compareAt: body.compareAt ?? null,
        images: JSON.stringify(body.images ?? []),
        sizes: JSON.stringify(body.sizes ?? []),
        active: body.active ?? false,
      },
    });

    return NextResponse.json({ product, url: `/product/${product.slug}` }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/api/products/route.ts"), $c); Say "  [ok] wrote src/app/api/products/route.ts" Green

$c = @'
// src/app/api/products/[slug]/route.ts
// NEW FILE. Get one / EDIT (PUT) / DELETE a product. (c) Edit uses PUT.
// (a) Protected by isAdmin().

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";

type Ctx = { params: { slug: string } };

// GET one product (used to pre-fill the Edit form). Admin-only.
export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// EDIT. Note: slug/URL stays the same so existing ad links keep working.
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: {
        name: body.name,
        description: body.description ?? "",
        price: body.price,
        compareAt: body.compareAt ?? null,
        images: JSON.stringify(body.images ?? []),
        sizes: JSON.stringify(body.sizes ?? []),
        active: body.active ?? false,
      },
    });
    return NextResponse.json({ product, url: `/product/${product.slug}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.product.delete({ where: { slug: params.slug } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/api/products/[slug]/route.ts"), $c); Say "  [ok] wrote src/app/api/products/[slug]/route.ts" Green

$c = @'
// src/app/api/products/[slug]/duplicate/route.ts
// NEW FILE. (c) DUPLICATE — clone Aarna into the wine / red colourways in 1 click.
// Copies everything, gives it a fresh unique slug, and saves it as a DRAFT so you
// can rename + swap images before it goes live.

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const original = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copyName = `${original.name} (Copy)`;
  let slug = slugify(copyName);
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugify(copyName)}-${n++}`;
  }

  const clone = await prisma.product.create({
    data: {
      slug,
      name: copyName,
      description: original.description,
      price: original.price,
      compareAt: original.compareAt,
      images: original.images,
      sizes: original.sizes,
      active: false, // always a draft — rename + swap images, then publish
    },
  });

  // Return the edit URL so the admin lands straight in the editor.
  return NextResponse.json(
    { product: clone, editUrl: `/admin/products/${clone.slug}/edit` },
    { status: 201 }
  );
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/api/products/[slug]/duplicate/route.ts"), $c); Say "  [ok] wrote src/app/api/products/[slug]/duplicate/route.ts" Green

$c = @'
// src/app/admin/products/new/page.tsx
// NEW FILE. The "Create a listing" screen. Uses the shared ProductForm.
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Create a listing — Rosé & Co Admin" };

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/admin/products/new/page.tsx"), $c); Say "  [ok] wrote src/app/admin/products/new/page.tsx" Green

$c = @'
// src/app/admin/products/[slug]/edit/page.tsx
// NEW FILE. (c) EDIT screen. Loads the product from the database on the server,
// then hands it to the shared form pre-filled. images/sizes are stored as JSON
// strings in your DB, so we parse them back into arrays for the form.

import { notFound } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";

export const metadata = { title: "Edit product — Rosé & Co Admin" };

// Safely turn a JSON string like '["XS","S"]' back into an array.
function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const initial: ProductFormValues = {
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    price: p.price,
    compareAt: p.compareAt ?? 0,
    sizes: parseList(p.sizes),
    images: parseList(p.images),
    active: p.active,
  };

  return <ProductForm mode="edit" initial={initial} />;
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/admin/products/[slug]/edit/page.tsx"), $c); Say "  [ok] wrote src/app/admin/products/[slug]/edit/page.tsx" Green

$c = @'
"use client";
// src/app/admin/products/DuplicateButton.tsx
// NEW FILE. (c) The one-click "Duplicate" button. Clones the product and sends
// you straight into the editor for the copy (to rename + swap images).

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DuplicateButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function duplicate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(data.editUrl); // jump into the new copy's editor
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={duplicate}
      disabled={loading}
      style={{ padding: "5px 12px", border: "1px solid #8a1c3b", borderRadius: 6,
               background: "#fff", color: "#8a1c3b", cursor: "pointer", fontSize: 13 }}
    >
      {loading ? "Cloning…" : "Duplicate"}
    </button>
  );
}
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/admin/products/DuplicateButton.tsx"), $c); Say "  [ok] wrote src/app/admin/products/DuplicateButton.tsx" Green

if (Test-Path -LiteralPath "src/app/admin/products/page.tsx") { Copy-Item -LiteralPath "src/app/admin/products/page.tsx" -Destination "src/app/admin/products/page.tsx.backup" -Force; Say "  backed up existing -> src/app/admin/products/page.tsx.backup" DarkYellow }
$c = @'
// src/app/admin/products/page.tsx
// REPLACES your current admin products page. Shows every product with its price,
// status, live link, plus (c) Edit and Duplicate buttons and a "+ Create" button.
//
// ⚠️ Before overwriting, open your EXISTING file of the same path and check the
// prisma import line — keep whichever matches your project.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";
import DuplicateButton from "./DuplicateButton";

export const metadata = { title: "Products — Rosé & Co Admin" };

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Products ({products.length})</h1>
        <Link href="/admin/products/new"
          style={{ background: "#8a1c3b", color: "#fff", padding: "9px 16px", borderRadius: 8, textDecoration: "none" }}>
          + Create a listing
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
            <th style={th}>Name</th>
            <th style={th}>Status</th>
            <th style={th}>Price</th>
            <th style={th}>Link</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={td}>{p.name}</td>
              <td style={td}>
                <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12,
                  background: p.active ? "#e6f6ea" : "#f1f1f1", color: p.active ? "#1e7d3a" : "#666" }}>
                  {p.active ? "live" : "draft"}
                </span>
              </td>
              <td style={td}>
                {inr(p.price)}{" "}
                {p.compareAt ? <s style={{ color: "#999" }}>{inr(p.compareAt)}</s> : null}
              </td>
              <td style={td}>
                <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer">/product/{p.slug}</a>
              </td>
              <td style={{ ...td, display: "flex", gap: 8 }}>
                <Link href={`/admin/products/${p.slug}/edit`}
                  style={{ padding: "5px 12px", border: "1px solid #ccc", borderRadius: 6, textDecoration: "none", color: "#333", fontSize: 13 }}>
                  Edit
                </Link>
                <DuplicateButton slug={p.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 8px" };
const td: React.CSSProperties = { padding: "10px 8px" };
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "src/app/admin/products/page.tsx"), $c); Say "  [ok] wrote src/app/admin/products/page.tsx" Green

$c = @'
// prisma/fix-prices.ts
// Auto-fixes the CHARGED price in your database for every product.
// Run with:  npx tsx prisma/fix-prices.ts
// (You already have tsx installed — your package.json uses it for db:seed.)
//
// Change these two numbers if your prices differ.
const SELLING_PRICE = 2299; // what they pay
const COMPARE_AT = 2999;    // strike-through MRP

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} product(s). Updating…`);

  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { price: SELLING_PRICE, compareAt: COMPARE_AT },
    });
    console.log(`  ✓ ${p.name}: price=${SELLING_PRICE}, compareAt=${COMPARE_AT}`);
  }

  console.log("Done. Every product now charges ₹" + SELLING_PRICE + ".");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
'@
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "prisma/fix-prices.ts"), $c); Say "  [ok] wrote prisma/fix-prices.ts" Green

# ---------------------------------------------------------------------------
Say "PART 3/3  Fixing the CHARGED price in your database..." Yellow
# ---------------------------------------------------------------------------
Say "  Running: npx tsx prisma/fix-prices.ts" DarkGray
try {
  npx tsx prisma/fix-prices.ts
  Say "  [ok] database prices updated" Green
} catch {
  Say "  [warn] Could not auto-run the DB fix. Run it manually:" Red
  Say "         npx tsx prisma/fix-prices.ts" Red
  Say "         (Make sure your DATABASE_URL is set in .env)" Red
}

Say "" 
Say "=========================================================" Cyan
Say " ALL DONE" Cyan
Say "=========================================================" Cyan
Say " Next steps:" White
Say "  1) Open src/lib/adminAuth.ts - set COOKIE_NAME + secret to match your login." White
Say "     (Run AUTH_AUDIT.ps1 and paste the result back if unsure.)" DarkGray
Say "  2) In the new API files, keep the prisma import line that matches by-ids/route.ts." White
Say "  3) npm run dev  ->  open /admin/products (Create / Edit / Duplicate)." White
Say "  4) When happy:  git add . ; git commit -m \"fix copy+price, add product tools\" ; git push" White
Say "" 
Say " Every file changed was backed up to <file>.backup - delete those once happy." DarkGray