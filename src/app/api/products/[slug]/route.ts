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

    // FIX: without this, an edit saved here (new image order, new video,
    // price change, anything) would correctly write to the database, but
    // the LIVE product page and /shop listing would keep serving an old
    // cached snapshot for up to 5 minutes (the `revalidate = 300` timer
    // in product/[slug]/page.tsx and shop/page.tsx) — and even then, only
    // update on the NEXT visitor's request after that window passed, not
    // instantly. revalidatePath('/', 'layout') busts the cache for every
    // page under the root layout the moment Save & publish is clicked, so
    // changes appear on the live site immediately instead of on a delay.
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

    // Same cache-busting reasoning as PUT above — a deleted product
    // should stop appearing on /shop and its own page immediately.
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
