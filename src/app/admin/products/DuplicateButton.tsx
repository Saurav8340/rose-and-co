"use client";
// src/app/admin/products/DuplicateButton.tsx
// NEW FILE. (c) The one-click "Duplicate" button. Clones the product and sends
// you straight into the editor for the copy (to rename + swap images).

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DuplicateButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function duplicate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(data.editUrl); // jump into the new copy's editor
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={duplicate}
      disabled={loading}
      style={{ padding: "5px 12px", border: "1px solid #8a1c3b", borderRadius: 6,
               background: "#fff", color: "#8a1c3b", cursor: "pointer", fontSize: 13 }}
    >
      {loading ? "Cloningâ€¦" : "Duplicate"}
    </button>
  );
}