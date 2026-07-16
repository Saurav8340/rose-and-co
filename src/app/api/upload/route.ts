// src/app/api/upload/route.ts
// NEW FILE. Receives an uploaded image, auto-compresses it with sharp (which you
// already have installed), and returns a small data URL string.
//
// WHY THIS APPROACH: it works on Vercel with ZERO setup â€” no storage account,
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