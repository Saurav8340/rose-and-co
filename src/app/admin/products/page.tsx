// src/app/admin/products/page.tsx
// Converted from raw inline styles (completely unstyled/disconnected from
// your design system) to your actual Tailwind dark theme, matching the
// rest of your admin panel.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DuplicateButton from "./DuplicateButton";
import { inr } from "@/lib/format";

export const metadata = { title: "Products — Rosé & Co Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container-x py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-ivory">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary rc-glow-btn">
          + Create a listing
        </Link>
      </div>

      <div className="overflow-x-auto border border-taupe/20 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-blush/60 text-xs uppercase tracking-widest text-ivory">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Link</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-taupe/20 hover:bg-blush/20 transition">
                <td className="p-3 text-ivory">{p.name}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${p.active ? 'bg-wine/20 text-wine border border-wine/30' : 'bg-taupe/20 text-ivory/60 border border-taupe/30'}`}>
                    {p.active ? "live" : "draft"}
                  </span>
                </td>
                <td className="p-3 text-ivory">
                  {inr(p.price)}{" "}
                  {p.compareAt ? <s className="text-ivory/40">{inr(p.compareAt)}</s> : null}
                </td>
                <td className="p-3">
                  <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="text-wine underline hover:text-ivory transition">/product/{p.slug}</a>
                </td>
                <td className="p-3 flex gap-2">
                  <Link
                    href={`/admin/products/${p.slug}/edit`}
                    className="px-3 py-1.5 border border-taupe/40 rounded text-ivory hover:border-wine transition text-xs cursor-pointer"
                  >
                    Edit
                  </Link>
                  <DuplicateButton slug={p.slug} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-ivory/60">No products yet. Create your first listing above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
