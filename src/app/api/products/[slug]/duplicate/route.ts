// src/app/api/products/[slug]/duplicate/route.ts
// NEW FILE. (c) DUPLICATE â€” clone Aarna into the wine / red colourways in 1 click.
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
      active: false, // always a draft â€” rename + swap images, then publish
    },
  });

  // Return the edit URL so the admin lands straight in the editor.
  return NextResponse.json(
    { product: clone, editUrl: `/admin/products/${clone.slug}/edit` },
    { status: 201 }
  );
}

