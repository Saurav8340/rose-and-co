// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/adminAuth";

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

    // FIX (PageSpeed Insights — "Improve image delivery", ~123 KiB
    // wasted on the product page): images were being resized to 1000px
    // wide on upload, but the product gallery only ever displays a photo
    // at roughly 380-570px on real devices, even accounting for
    // high-density phone screens. Every visitor was downloading close to
    // 2x the pixel data actually needed for what's shown on screen.
    //
    // 828px is one of the exact breakpoints already listed in
    // next.config.js's `images.deviceSizes` — this means Next.js's
    // built-in image optimizer can serve this size directly without any
    // upscaling artifacts, while still looking fully sharp on retina/
    // high-DPI phones at the gallery's actual display width. This is a
    // ONE-TIME change to the resize step: every photo uploaded through
    // the admin form from now on, for every product, gets this smaller,
    // still-sharp size automatically — no per-product action needed.
    //
    // NOTE: this only affects photos uploaded AFTER this change ships.
    // Any product's existing photos (already sitting in Blob storage at
    // the old 1000px size) need to be manually removed and re-uploaded
    // in the admin edit page to pick up this saving retroactively.
    const output = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 828, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();

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
