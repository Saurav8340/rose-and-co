// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json(
      { product, url: `/product/${product.slug}` },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
