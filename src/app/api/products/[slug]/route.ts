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