// src/app/api/categories/route.ts
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

// GET — public. Used by nav, footer, collection pages, sitemap.
export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

// POST — admin only.
export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  let slug = slugify(body.name);
  let suffix = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${slugify(body.name)}-${++suffix}`;
  }

  const category = await prisma.category.create({
    data: {
      slug,
      name: body.name,
      description: body.description || null,
      image: body.image || null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      active: true,
    },
  });

  return NextResponse.json({ category, url: `/collections/${category.slug}` }, { status: 201 });
}




