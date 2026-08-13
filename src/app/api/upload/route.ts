// src/app/api/upload/route.ts
// Receives an uploaded image, auto-compresses it with sharp, and now
// uploads the compressed result to Vercel Blob storage instead of
// returning it as an inline base64 data URL.
//
// FIX (major performance issue found via PageSpeed Insights): this route
// used to return `data:image/webp;base64,...` — a giant text string that
// got saved directly into Product.images in the database, then rendered
// straight into the page's HTML. That meant the browser had to download
// the ENTIRE page response (5,000+ KB on the Blood Ritual Set page)
// before it could show a single image, since the image data was stuck
// INSIDE the HTML/RSC payload rather than being its own separate
// resource the browser can fetch in parallel. This measured as a 23.8
// SECOND Largest Contentful Paint on mobile. A real image URL lets the
// browser start downloading it immediately, in parallel with everything
// else — this is the single biggest lever on real-world page speed for
// this entire site.
//
// No changes needed in ProductForm.tsx — it already just does
// `fetch('/api/upload', ...)` and uses whatever `url` comes back. That
// used to be a base64 string; now it's a real Blob URL. Everything
// downstream (Product.images, ProductGallery.tsx) already just treats
// it as a plain image src string either way.
//
// IMPORTANT: existing products (e.g. Blood Ritual Set) already have
// their 7 images saved as base64 in the database from BEFORE this fix.
// This fix only applies to NEW uploads going forward — to get the
// speed benefit on existing products, re-upload their images through
// the admin edit page after this change is live.

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";

// Vercel's default serverless function body size limit is around 4.5MB.
// Lowered from the old 8MB cap so an oversized upload fails with OUR
// clear error message below, instead of a generic 413 from the
// platform itself before this code even runs.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file received." }, { status: 400 });

    if (file.size > MAX_BYTES)
      return NextResponse.json(
        { error: "Image is larger than 4 MB. Most phone photos compress fine under this — try re-saving or choosing a smaller version." },
        { status: 400 }
      );

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Resize to max 1000px wide, convert to webp ~72% quality (small + sharp-looking).
    const output = await sharp(inputBuffer)
      .rotate() // respect phone photo orientation
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();

    // Upload the COMPRESSED result to Blob storage (not the database).
    const blob = await put(
      `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`,
      output,
      {
        access: "public",
        contentType: "image/webp",
      }
    );

    return NextResponse.json({ url: blob.url, bytes: output.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not process image." }, { status: 500 });
  }
}



