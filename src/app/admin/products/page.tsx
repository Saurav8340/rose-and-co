// src/app/admin/products/page.tsx
// REPLACES your current admin products page. Shows every product with its price,
// status, live link, plus (c) Edit and Duplicate buttons and a "+ Create" button.
//
// âš ï¸ Before overwriting, open your EXISTING file of the same path and check the
// prisma import line â€” keep whichever matches your project.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
// import prisma from "@/lib/db";
import DuplicateButton from "./DuplicateButton";

export const metadata = { title: "Products â€” RosÃ© & Co Admin" };

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Products ({products.length})</h1>
        <Link href="/admin/products/new"
          style={{ background: "#8a1c3b", color: "#fff", padding: "9px 16px", borderRadius: 8, textDecoration: "none" }}>
          + Create a listing
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
            <th style={th}>Name</th>
            <th style={th}>Status</th>
            <th style={th}>Price</th>
            <th style={th}>Link</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={td}>{p.name}</td>
              <td style={td}>
                <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12,
                  background: p.active ? "#e6f6ea" : "#f1f1f1", color: p.active ? "#1e7d3a" : "#666" }}>
                  {p.active ? "live" : "draft"}
                </span>
              </td>
              <td style={td}>
                {inr(p.price)}{" "}
                {p.compareAt ? <s style={{ color: "#999" }}>{inr(p.compareAt)}</s> : null}
              </td>
              <td style={td}>
                <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer">/product/{p.slug}</a>
              </td>
              <td style={{ ...td, display: "flex", gap: 8 }}>
                <Link href={`/admin/products/${p.slug}/edit`}
                  style={{ padding: "5px 12px", border: "1px solid #ccc", borderRadius: 6, textDecoration: "none", color: "#333", fontSize: 13 }}>
                  Edit
                </Link>
                <DuplicateButton slug={p.slug} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 8px" };
const td: React.CSSProperties = { padding: "10px 8px" };