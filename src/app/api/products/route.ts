// src/app/api/products/route.ts
// NEW FILE. Create + list products. Matches your Prisma "Product" model:
//   slug, name, description, price, compareAt, images(String), sizes(String), active
// (a) Protected by isAdmin() so only a logged-in admin can create.

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

// âš ï¸ MATCH THIS IMPORT to your other files.
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