// src/app/admin/products/[slug]/edit/page.tsx
// EDIT screen. Loads the product from the database on the server,
// then hands it to the shared form pre-filled. images/sizes are stored as JSON
// strings in your DB, so we parse them back into arrays for the form.
//
// FIX (permanent): parseList() only ever returned string[]. Now that sizes
// are stored as [{size, stock}] objects (see ProductForm.tsx fix), we need
// a generic parser so sizes come back as objects, not broken/empty data.

import { notFound } from "next/navigation";
import ProductForm, { ProductFormValues } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit product — Rosé & Co Admin" };

// Generic-safe JSON parse: returns fallback if the field is empty or invalid,
// otherwise returns whatever shape was actually stored (string[] for images,
// {size,stock}[] for sizes, etc.)
function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export default async function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const rawSizes = parseJSON<any[]>(p.sizes, []);

  // Backward-compat: if an OLDER product still has sizes saved as plain
  // strings (e.g. ["S","M"]) from before this fix, convert them to
  // {size, stock: 0} on the fly so the form doesn't crash and you can
  // just type in real stock numbers and re-save.
  const sizes: { size: string; stock: number }[] = rawSizes.map((s) =>
    typeof s === "string" ? { size: s, stock: 0 } : { size: s.size, stock: s.stock ?? 0 }
  );

  const initial: ProductFormValues = {
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    price: p.price,
    compareAt: p.compareAt ?? 0,
    sizes,
    images: parseJSON<string[]>(p.images, []),
    bulletPoints: parseJSON<string[]>(p.bulletPoints, []),
    videos: parseJSON<string[]>(p.videos, []),
    categoryId: (p as any).categoryId ?? null,
    active: p.active,
  };

  return <ProductForm mode="edit" initial={initial} />;
}

