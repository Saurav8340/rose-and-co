// src/app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
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
