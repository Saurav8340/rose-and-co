"use client";
// src/components/admin/ProductForm.tsx
// ONE form used by BOTH "Create" and "Edit". Every box maps to a column in your
// Product database table (slug, name, description, price, compareAt, images,
// sizes, bulletPoints, videos, categoryId, active).
//
// FIX (permanent): sizes used to be saved as a flat list of strings, e.g.
// ["S","M","L"], with no stock count anywhere. /api/inventory/route.ts
// expects each size to be an object like {"size":"S","stock":10} so it can
// sum up total stock for the "Only X left" countdown. Because the old form
// never collected a stock number, every product created here saved stock
// as effectively undefined -> 0, so every product showed "Only 0 left"
// no matter what sizes were picked. Fixed by collecting a real stock number
// per size below, and storing {size, stock} objects from the start.

import { useEffect, useMemo, useState } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface Category {
  id: string;
  slug: string;
  name: string;
}

type SizeStock = { size: string; stock: number };

// Shape we pass in when editing an existing product.
export type ProductFormValues = {
  slug?: string;
  name: string;
  description: string;
  price: number;
  compareAt: number;
  sizes: SizeStock[];
  images: string[];
  bulletPoints?: string[];
  videos?: string[];
  categoryId?: string | null;
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
  const [price, setPrice] = useState<number | "">(initial?.price ?? "");
  const [compareAt, setCompareAt] = useState<number | "">(initial?.compareAt ?? "");

  // sizes is now an array of { size, stock } objects, not plain strings.
  const [sizes, setSizes] = useState<SizeStock[]>(
    initial?.sizes?.length ? initial.sizes : []
  );

  const [images, setImages] = useState<string[]>(
    initial?.images?.length ? initial.images : [""]
  );
  const [bulletPoints, setBulletPoints] = useState<string[]>(
    initial?.bulletPoints?.length ? initial.bulletPoints : [""]
  );
  const [videos, setVideos] = useState<string[]>(
    initial?.videos?.length ? initial.videos : [""]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? "");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ url: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  async function createCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create category.");
      setCategories((prev) => [...prev, data.category]);
      setCategoryId(data.category.id);
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreatingCategory(false);
    }
  }

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

  function updateBullet(index: number, value: string) {
    setBulletPoints((prev) => prev.map((b, j) => (j === index ? value : b)));
  }
  function addBullet() {
    setBulletPoints((prev) => [...prev, ""]);
  }
  function removeBullet(index: number) {
    setBulletPoints((prev) => prev.filter((_, j) => j !== index));
  }

  function updateVideo(index: number, value: string) {
    setVideos((prev) => prev.map((v, j) => (j === index ? value : v)));
  }
  function addVideo() {
    setVideos((prev) => [...prev, ""]);
  }
  function removeVideo(index: number) {
    setVideos((prev) => prev.filter((_, j) => j !== index));
  }

  const previewSlug = useMemo(
    () =>
      (initial?.slug ??
        name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")),
    [name, initial?.slug]
  );

  // Clicking a size toggles it in/out of the sizes array. Turning ON adds
  // it with stock 0 (you then type the real number). Turning OFF removes
  // it entirely, same as before.
  function toggleSize(s: string) {
    setSizes((prev) => {
      const exists = prev.find((x) => x.size === s);
      if (exists) return prev.filter((x) => x.size !== s);
      return [...prev, { size: s, stock: 0 }];
    });
  }

  function updateStock(s: string, value: number) {
    const safe = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    setSizes((prev) => prev.map((x) => (x.size === s ? { ...x, stock: safe } : x)));
  }

  async function save(publish: boolean) {
    setError("");
    if (!name.trim()) return setError("Product name is required.");
    if (!price) return setError("Selling price is required.");

    setSaving(true);
    const payload = {
      name,
      description,
      price: Number(price),
      compareAt: compareAt ? Number(compareAt) : null,
      sizes,
      images: images.filter((i) => i.trim()),
      bulletPoints: bulletPoints.filter((b) => b.trim()),
      videos: videos.filter((v) => v.trim()),
      categoryId: categoryId || null,
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
      <div className="max-w-xl mx-auto my-16 p-8 text-center rc-card rounded-xl">
        <h1 className="font-display text-2xl text-ivory">
          {mode === "create" ? "Product created" : "Changes saved"}
        </h1>
        <p className="my-4">
          <a href={done.url} target="_blank" rel="noreferrer" className="text-wine font-semibold underline hover:text-ivory transition">
            {done.url}
          </a>
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-4 py-2 border border-taupe/40 rounded-lg text-ivory hover:border-wine transition cursor-pointer"
            onClick={() => navigator.clipboard.writeText(done.url)}
          >
            Copy link
          </button>
          <a
            className="px-4 py-2 border border-taupe/40 rounded-lg text-ivory hover:border-wine transition"
            href="/admin/products"
          >
            Back to products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6">
      <h1 className="font-display text-2xl text-ivory mb-6">
        {mode === "create" ? "Create a listing" : `Edit: ${initial?.name}`}
      </h1>

      {/* ---- Basic details ---- */}
      <label className="label">Product name</label>
      <input
        className="input mb-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Blood Spiral Crop Top"
      />
      {name && (
        <p className="text-xs text-ivory/50 mt-1">
          URL: <code className="text-ivory/70">/product/{previewSlug}</code>
          {mode === "edit" && " (URL stays the same when editing)"}
        </p>
      )}

      <label className="label mt-4">Description (shown as &quot;The piece&quot; on the product page)</label>
      <textarea
        className="input min-h-[100px]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Fitted red graphic crop top with a black spiral chest print. Built for layering under a harness or worn alone with plaid bottoms."
      />

      {/* ---- Category ---- */}
      <label className="label mt-4">Category</label>
      <div className="flex gap-2 items-start">
        <select
          className="input flex-1 cursor-pointer"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowNewCategory((s) => !s)}
          className="px-3 py-3 border border-taupe/40 rounded-lg text-ivory hover:border-wine transition text-sm cursor-pointer whitespace-nowrap"
        >
          + New
        </button>
      </div>
      {showNewCategory && (
        <div className="flex gap-2 mt-2">
          <input
            className="input flex-1"
            placeholder="e.g. Corsets & Bodices"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            type="button"
            disabled={creatingCategory}
            onClick={createCategory}
            className="px-4 py-2 bg-wine text-ivory rounded-lg hover:bg-wine/90 transition cursor-pointer whitespace-nowrap"
          >
            {creatingCategory ? "Creating…" : "Create"}
          </button>
        </div>
      )}
      <p className="text-xs text-ivory/50 mt-1">
        New categories automatically get their own page at /collections/[name] — no code changes needed.
      </p>

      {/* ---- Pricing ---- */}
      <div className="flex gap-3 mt-4">
        <div className="flex-1">
          <label className="label">Selling price (₹)</label>
          <input
            className="input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : +e.target.value)}
            placeholder="699"
          />
        </div>
        <div className="flex-1">
          <label className="label">MRP / compare-at (₹) — optional</label>
          <input
            className="input"
            type="number"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value === "" ? "" : +e.target.value)}
            placeholder="999"
          />
        </div>
      </div>
      <p className="text-xs text-ivory/50 mt-1">
        Leave MRP blank and one will be estimated automatically. Prepaid discount and COD split are calculated automatically from the selling price — no need to set those separately.
      </p>

      {/* ---- Sizes + stock (FIXED) ---- */}
      <label className="label mt-4">Sizes & stock</label>
      <p className="text-xs text-ivory/50 mb-2">
        Click a size to enable it, then type how many units you actually have.
        Leaving stock at 0 shows the size as sold out on the product page —
        deselecting the size hides it entirely.
      </p>
      <div className="space-y-2 mb-2">
        {ALL_SIZES.map((s) => {
          const entry = sizes.find((x) => x.size === s);
          const selected = !!entry;
          return (
            <div key={s} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSize(s)}
                className={`w-16 px-4 py-2 border rounded-lg cursor-pointer transition ${
                  selected
                    ? "bg-wine border-wine text-ivory"
                    : "bg-blush border-taupe/40 text-ivory hover:border-wine"
                }`}
              >
                {s}
              </button>
              {selected && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-ivory/60 whitespace-nowrap">
                    Stock qty:
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="input w-24"
                    value={entry!.stock}
                    onChange={(e) => updateStock(s, Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Bullet points (Amazon-style feature list) ---- */}
      <label className="label mt-4">Bullet points</label>
      <p className="text-xs text-ivory/50 mb-2">
        Short feature lines shown on the product page, like &quot;Real steel boning&quot; or &quot;Adjustable lacing.&quot;
      </p>
      <div className="space-y-2">
        {bulletPoints.map((b, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={b}
              onChange={(e) => updateBullet(i, e.target.value)}
              placeholder="Real metal D-rings, not printed graphics"
            />
            <button
              type="button"
              onClick={() => removeBullet(i)}
              className="w-11 h-11 flex items-center justify-center border border-taupe/40 rounded-lg text-ivory/60 hover:text-wine hover:border-wine transition cursor-pointer"
              aria-label="Remove bullet point"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addBullet}
        className="mt-2 text-sm text-wine hover:text-ivory underline transition cursor-pointer"
      >
        + Add bullet point
      </button>

      {/* ---- Videos ---- */}
      <label className="label mt-6">Product videos — optional</label>
      <p className="text-xs text-ivory/50 mb-2">
        Paste a video link (YouTube, Vimeo, or any hosted URL). Large video files should not be uploaded directly.
      </p>
      <div className="space-y-2">
        {videos.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={v}
              onChange={(e) => updateVideo(i, e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <button
              type="button"
              onClick={() => removeVideo(i)}
              className="w-11 h-11 flex items-center justify-center border border-taupe/40 rounded-lg text-ivory/60 hover:text-wine hover:border-wine transition cursor-pointer"
              aria-label="Remove video"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addVideo}
        className="mt-2 text-sm text-wine hover:text-ivory underline transition cursor-pointer"
      >
        + Add video link
      </button>

      {/* ---- Images ---- */}
      <label className="label mt-6">Product images</label>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="block border-2 border-dashed border-taupe/40 rounded-xl px-4 py-7 text-center cursor-pointer bg-blush/40 text-ivory hover:border-wine transition mb-2"
      >
        {uploading ? "Uploading & compressing…" : "Click to choose photos, or drag them here"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      <p className="text-xs text-ivory/50">JPG/PNG/HEIC up to 8 MB each. They&apos;re auto-shrunk to load fast.</p>

      {images.filter((i) => i.trim()).length > 0 && (
        <div className="flex flex-wrap gap-3 my-3">
          {images.filter((i) => i.trim()).map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Product image ${i + 1}`}
                className="w-[90px] h-[90px] object-cover rounded-lg border border-taupe/30"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full bg-wine text-ivory cursor-pointer flex items-center justify-center text-xs leading-none"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-wine font-semibold mt-4">⚠ {error}</p>}

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          disabled={saving}
          onClick={() => save(false)}
          className="px-5 py-3 border border-taupe/40 rounded-lg text-ivory hover:border-wine transition cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save as draft"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(true)}
          className="px-5 py-3 bg-wine text-ivory rounded-lg hover:bg-wine/90 rc-glow-btn transition cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Publish (go live)" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}
