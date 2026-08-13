// src/app/api/categories/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    const category = await prisma.category.update({
      where: { slug: params.slug },
      data: {
        name: body.name,
        description: body.description ?? null,
        image: body.image ?? null,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
      },
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Could not update category." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.updateMany({
    where: { categoryId: category.id },
    data: { categoryId: null },
  });
  await prisma.category.delete({ where: { slug: params.slug } });

  return NextResponse.json({ ok: true });
}

