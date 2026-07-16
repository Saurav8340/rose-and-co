// src/app/admin/products/[slug]/edit/page.tsx
// NEW FILE. (c) EDIT screen. Loads the product from the database on the server,
// then hands it to the shared form pre-filled. images/sizes are stored as JSON
// strings in your DB, so we parse them back into arrays for the form.

import { notFound } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";

export const metadata = { title: "Edit product â€” RosÃ© & Co Admin" };

// Safely turn a JSON string like '["XS","S"]' back into an array.
function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const initial: ProductFormValues = {
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    price: p.price,
    compareAt: p.compareAt ?? 0,
    sizes: parseList(p.sizes),
    images: parseList(p.images),
    active: p.active,
  };

  return <ProductForm mode="edit" initial={initial} />;
}