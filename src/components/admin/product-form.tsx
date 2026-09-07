"use client";

import { useMemo, useState, useCallback } from "react";
import { marginPercent, rupeesToPaise } from "@/lib/money";
import { splitProductImages } from "@/lib/services/product-image-slots";

type Option = { id: string; name: string };

type ProductImage = {
  id: string;
  url: string;
  alt: string;
  type: string;
  position: number;
};

type ProductValues = {
  id?: string;
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  supplierId?: string | null;
  brand?: string;
  costPaise?: number;
  sellingPaise?: number;
  compareAtPaise?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  status?: string;
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: ProductImage[];
};

function ImageSlot({
  label,
  hint,
  name,
  deleteName,
  url,
  onUrlChange,
  onUpload,
}: {
  label: string;
  hint: string;
  name: string;
  deleteName: string;
  url: string;
  onUrlChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border-2 border-line bg-card p-4 transition hover:border-primary/40">
      <p className="text-base font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div className="mt-3">
        {url ? (
          <img src={url} alt="" className="aspect-square w-full rounded-xl object-cover bg-[#ece6dc]" />
        ) : (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-[#ece6dc] text-sm text-muted transition hover:border-primary/50 hover:bg-[#f6f1ea]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span>Drop image or click to upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </label>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://… or /images/…"
          className="h-10 flex-1 rounded-xl border border-line px-3 text-sm"
        />
        {url && (
          <button
            type="button"
            className="h-10 rounded-xl border border-[#9b2c2c] px-3 text-sm text-[#9b2c2c]"
            onClick={() => onUrlChange("")}
          >
            Clear
          </button>
        )}
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-[#9b2c2c]">
        <input type="checkbox" name={deleteName} />
        Delete on save
      </label>
    </div>
  );
}

export function ProductForm({
  categories,
  suppliers,
  product,
}: {
  categories: Option[];
  suppliers: Option[];
  product?: ProductValues;
}) {
  const [cost, setCost] = useState(((product?.costPaise ?? 0) / 100).toString());
  const [sell, setSell] = useState(((product?.sellingPaise ?? 0) / 100).toString());
  const split = splitProductImages(product?.images ?? []);
  const [mainUrl, setMainUrl] = useState(split.main?.url ?? "");
  const [extras, setExtras] = useState(["", "", "", ""].map((empty, i) => split.extras[i]?.url ?? empty));
  const margin = useMemo(() => {
    const c = rupeesToPaise(Number(cost) || 0);
    const s = rupeesToPaise(Number(sell) || 0);
    return marginPercent(s, c);
  }, [cost, sell]);

  const handleUpload = useCallback(async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      return data.url;
    }
    throw new Error("Upload failed");
  }, []);

  const action = product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products";

  return (
    <form action={action} method="post" className="mt-6 grid max-w-5xl gap-4">
      <section className="rounded-3xl border-2 border-primary/40 bg-[#f6f1ea] p-4 sm:p-5">
        <h2 className="font-display text-2xl">Product photos</h2>
        <p className="mt-1 text-sm text-muted">
          Add the main photo first, then up to four more photos. Upload images directly or paste URLs. These extra photos become the four small boxes on the shop product page.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ImageSlot
            label="Main image"
            hint="Large photo on the product page and in search results"
            name="imageUrl"
            deleteName="deleteMain"
            url={mainUrl}
            onUrlChange={setMainUrl}
            onUpload={async (file) => {
              const url = await handleUpload(file);
              setMainUrl(url);
            }}
          />
          {extras.map((url, index) => (
            <ImageSlot
              key={index}
              label={`Extra photo ${index + 1}`}
              hint={`Thumbnail ${index + 1} on the product page`}
              name={`extraImage${index + 1}`}
              deleteName={`deleteExtra${index + 1}`}
              url={url}
              onUrlChange={(value) =>
                setExtras((current) => current.map((item, i) => (i === index ? value : item)))
              }
              onUpload={async (file) => {
                const url = await handleUpload(file);
                setExtras((current) => current.map((item, i) => (i === index ? url : item)));
              }}
            />
          ))}
        </div>
      </section>
      <input name="sku" required defaultValue={product?.sku} placeholder="SKU" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="name" required defaultValue={product?.name} placeholder="Name" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="slug" required defaultValue={product?.slug} placeholder="slug" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <textarea name="shortDescription" defaultValue={product?.shortDescription} placeholder="Short description" className="min-h-20 rounded-xl border border-line px-3 py-2 text-sm" />
      <textarea name="description" defaultValue={product?.description} placeholder="Description" className="min-h-32 rounded-xl border border-line px-3 py-2 text-sm" />
      <select name="categoryId" required defaultValue={product?.categoryId} className="h-11 rounded-xl border border-line px-3 text-sm">
        <option value="">Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select name="supplierId" defaultValue={product?.supplierId ?? ""} className="h-11 rounded-xl border border-line px-3 text-sm">
        <option value="">Supplier (optional)</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input name="brand" defaultValue={product?.brand} placeholder="Brand" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Cost (₹)
          <input name="costRupees" value={cost} onChange={(e) => setCost(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
        <label className="text-sm">
          Selling (₹)
          <input name="sellingRupees" value={sell} onChange={(e) => setSell(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
        <label className="text-sm">
          Compare-at (₹)
          <input name="compareRupees" defaultValue={product?.compareAtPaise ? product.compareAtPaise / 100 : ""} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
      </div>
      <p className="text-sm">Margin {margin}% (not shown to customers)</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="lowStockThreshold" type="number" min={0} defaultValue={product?.lowStockThreshold ?? 5} className="h-11 rounded-xl border border-line px-3 text-sm" />
      </div>
      <select name="status" defaultValue={product?.status ?? "ACTIVE"} className="h-11 rounded-xl border border-line px-3 text-sm">
        <option>DRAFT</option>
        <option>ACTIVE</option>
        <option>ARCHIVED</option>
        <option>OUT_OF_STOCK</option>
      </select>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="trending" defaultChecked={product?.trending} /> Trending
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="bestSeller" defaultChecked={product?.bestSeller} /> Best seller
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="newArrival" defaultChecked={product?.newArrival} /> New
        </label>
      </div>
      <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} placeholder="SEO title" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <input name="seoDescription" defaultValue={product?.seoDescription ?? ""} placeholder="SEO description" className="h-11 rounded-xl border border-line px-3 text-sm" />
      <button type="submit" className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">
        {product?.id ? "Save photos and product" : "Create"}
      </button>
    </form>
  );
}