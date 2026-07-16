"use client";
// src/components/admin/ProductForm.tsx
// ONE form used by BOTH "Create" and "Edit". Every box maps to a column in your
// Product database table (slug, name, description, price, compareAt, images, sizes, active).

import { useMemo, useState } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Shape we pass in when editing an existing product.
export type ProductFormValues = {
  slug?: string;
  name: string;
  description: string;
  price: number;
  compareAt: number;
  sizes: string[];
  images: string[];
  active: boolean;
};

export default function ProductForm({
  initial,
  mode,
}: {
  initial?: ProductFormValues;
  mode: "create" | "edit";
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<number>(initial?.price ?? 2299);
  const [compareAt, setCompareAt] = useState<number>(initial?.compareAt ?? 2999);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? [...ALL_SIZES]);
  const [images, setImages] = useState<string[]>(
    initial?.images?.length ? initial.images : [""]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ url: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload one or more chosen files, compress via /api/upload, add to images.
  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        added.push(data.url);
      }
      // drop any empty placeholder boxes, then append the new images
      setImages((prev) => [...prev.filter((i) => i.trim()), ...added]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, j) => j !== index));
  }

  const previewSlug = useMemo(
    () =>
      (initial?.slug ??
        name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")),
    [name, initial?.slug]
  );

  function toggleSize(s: string) {
    setSizes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  async function save(publish: boolean) {
    setError("");
    if (!name.trim()) return setError("Product name is required.");
    if (!price) return setError("Selling price is required.");

    setSaving(true);
    const payload = {
      name,
      description,
      price,
      compareAt,
      sizes,
      images: images.filter((i) => i.trim()),
      active: publish,
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/products/${initial!.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      const slug = data.product?.slug ?? initial?.slug;
      setDone({ url: `/product/${slug}` });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", padding: 20, textAlign: "center" }}>
        <h1>{mode === "create" ? "âœ… Product created" : "âœ… Changes saved"}</h1>
        <p style={{ margin: "16px 0" }}>
          <a href={done.url} target="_blank" rel="noreferrer" style={{ color: "#8a1c3b", fontWeight: 600 }}>
            {done.url}
          </a>
        </p>
        <button style={btn} onClick={() => navigator.clipboard.writeText(done.url)}>Copy link</button>
        <a style={{ ...btn, textDecoration: "none", color: "#333" }} href="/admin/products">Back to products</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>
        {mode === "create" ? "Create a listing" : `Edit: ${initial?.name}`}
      </h1>

      <label style={lbl}>Product name
        <input style={inp} value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Aarna Beige Marble Swirl Co-ord Set" />
      </label>
      {name && (
        <p style={hint}>
          URL: <code>/product/{previewSlug}</code>
          {mode === "edit" && " (URL stays the same when editing)"}
        </p>
      )}

      <label style={lbl}>Description (the â€œThe setâ€ paragraph)
        <textarea style={{ ...inp, minHeight: 90 }} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A relaxed satin button-down shirt and high-waisted wide-leg pants. Hand-painted marble swirlâ€¦" />
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <label style={{ ...lbl, flex: 1 }}>Selling price (â‚¹)
          <input style={inp} type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
        </label>
        <label style={{ ...lbl, flex: 1 }}>MRP / compare-at (â‚¹)
          <input style={inp} type="number" value={compareAt} onChange={(e) => setCompareAt(+e.target.value)} />
        </label>
      </div>

      <label style={lbl}>Sizes in stock</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {ALL_SIZES.map((s) => (
          <button key={s} type="button" onClick={() => toggleSize(s)}
            style={{ ...sizeBtn, background: sizes.includes(s) ? "#8a1c3b" : "#fff",
                     color: sizes.includes(s) ? "#fff" : "#333" }}>
            {s}
          </button>
        ))}
      </div>

      <label style={lbl}>Product images</label>

      {/* Click-to-upload box (also accepts drag & drop). */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          display: "block", border: "2px dashed #c9a1ad", borderRadius: 12,
          padding: "26px 16px", textAlign: "center", cursor: "pointer",
          background: "#fdf7f9", color: "#8a1c3b", marginBottom: 12,
        }}
      >
        {uploading ? "Uploading & compressingâ€¦" : "ðŸ“· Click to choose photos, or drag them here"}
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      <p style={hint}>JPG/PNG/HEIC up to 8 MB each. Theyâ€™re auto-shrunk to load fast.</p>

      {/* Thumbnails of what's been added. */}
      {images.filter((i) => i.trim()).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "12px 0" }}>
          {images.filter((i) => i.trim()).map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Product image ${i + 1}`}
                style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
              <button type="button" onClick={() => removeImage(i)}
                style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22,
                         borderRadius: "50%", border: "none", background: "#8a1c3b", color: "#fff",
                         cursor: "pointer", lineHeight: "22px", padding: 0 }}>
                âœ•
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: "#c0392b", fontWeight: 600 }}>âš  {error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button type="button" style={btn} disabled={saving} onClick={() => save(false)}>
          {saving ? "Savingâ€¦" : "Save as draft"}
        </button>
        <button type="button" style={{ ...btn, background: "#8a1c3b", color: "#fff" }}
          disabled={saving} onClick={() => save(true)}>
          {saving ? "Savingâ€¦" : mode === "create" ? "Publish (go live)" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, margin: "14px 0 4px" };
const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", border: "1px solid #ccc", borderRadius: 8, font: "inherit" };
const btn: React.CSSProperties = { padding: "9px 16px", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", margin: "0 6px 0 0" };
const sizeBtn: React.CSSProperties = { padding: "8px 14px", border: "1px solid #8a1c3b", borderRadius: 8, cursor: "pointer" };
const hint: React.CSSProperties = { fontSize: 13, color: "#777", margin: "2px 0 0" };