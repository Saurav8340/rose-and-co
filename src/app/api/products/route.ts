// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.name || typeof body.price !== "number") {
    return NextResponse.json(
      { error: "Name and numeric price required." },
      { status: 400 }
    );
  }

  let slug = slugify(body.name);
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugify(body.name)}-${++suffix}`;
  }

  try {
    const product = await prisma.product.create({
      data: {
        slug,
        name: body.name,
        description: body.description || "",
        price: body.price,
        compareAt: body.compareAt ?? null,
        images: JSON.stringify(body.images ?? []),
        sizes: JSON.stringify(body.sizes ?? []),
        bulletPoints: JSON.stringify(body.bulletPoints ?? []),
        videos: JSON.stringify(body.videos ?? []),
        attributes: JSON.stringify(body.attributes ?? {}),
        categoryId: body.categoryId || null,
        active: body.active ?? true,
      },
    });

    // FIX: without this, the new/updated product would only appear on the
    // live site after the `revalidate = 300` timer in product/[slug]/page.tsx
    // and shop/page.tsx naturally expired (up to 5 minutes later, and only
    // on the NEXT visitor's request after that — not even instantly then).
    // revalidatePath('/', 'layout') busts the cache for every page under the
    // root layout immediately, so a newly created product shows up on /shop,
    // the homepage, and its own /product/[slug] page right away instead of
    // waiting on the timer. This runs on every product create — for a small
    // catalog like this, the cost of revalidating everything is negligible.
    revalidatePath('/', 'layout');

    return NextResponse.json(
      { product, url: `/product/${product.slug}` },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}




