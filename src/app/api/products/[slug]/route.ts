// src/app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        compareAt: body.compareAt ?? null,
        images: JSON.stringify(body.images ?? []),
        sizes: JSON.stringify(body.sizes ?? []),
        bulletPoints: JSON.stringify(body.bulletPoints ?? []),
        videos: JSON.stringify(body.videos ?? []),
        attributes: JSON.stringify(body.attributes ?? {}),
        categoryId: body.categoryId || null,
        active: body.active,
      },
    });

    // FIX: same reasoning as the POST route in products/route.ts — without
    // this, editing a product (new images, price, name, stock, etc.) in
    // admin would not appear on the live /product/[slug] page or /shop
    // listing until the 5-minute ISR timer expired AND someone visited
    // after that point. This makes admin edits show up on the live site
    // immediately after clicking "Save & publish".
    revalidatePath('/', 'layout');

    return NextResponse.json({ product, url: `/product/${product.slug}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.product.delete({ where: { slug: params.slug } });

    // FIX: same cache-busting reasoning — a deleted product should stop
    // appearing on /shop and its own product page immediately, not linger
    // for up to 5 minutes after deletion.
    revalidatePath('/', 'layout');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "This product has order history and can't be deleted. Set it to inactive instead, or remove its order items first.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
