import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  FileText,
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/AdminUi";
import { formatINR, stockLabel, stockStatus } from "@/lib/admin/format";
import { createEmptyProduct, useAdminStore } from "@/lib/admin/store";
import type { AdminProduct, CraftType } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: ProductsPage,
});

type Tab = "active" | "inactive" | "deleted";

function ProductsPage() {
  const { state, upsertProduct, softDeleteProduct, restoreProduct, hardDeleteProduct } = useAdminStore();
  const [tab, setTab] = useState<Tab>("active");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [manageMeta, setManageMeta] = useState(false);

  const filtered = useMemo(() => {
    return state.products
      .filter((p) => {
        if (tab === "deleted") return p.status === "deleted";
        if (tab === "inactive") return p.status === "inactive";
        return p.status === "active";
      })
      .filter((p) => (category === "all" ? true : p.categoryId === category))
      .filter((p) => {
        if (stockFilter === "all") return true;
        return stockStatus(p) === stockFilter;
      })
      .filter((p) => {
        const hay = `${p.name} ${p.sku}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });
  }, [state.products, tab, category, stockFilter, q]);

  function categoryName(id: string) {
    return state.categories.find((c) => c._id === id)?.name ?? "—";
  }

  return (
    <div className="admin-fade-in">
      <AdminPageHeader
        title="Products"
        description="Manage catalogue, categories, and collections"
        actions={
          <>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setManageMeta(true)}>
              Categories & Collections
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => setEditing(createEmptyProduct(state.categories[0]?._id ? { categoryId: state.categories[0]._id } : {}))}
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="admin-tabs">
          {(["active", "inactive", "deleted"] as Tab[]).map((t) => (
            <button key={t} type="button" className="admin-tab" data-active={tab === t} onClick={() => setTab(t)}>
              {t === "active" ? "Active" : t === "inactive" ? "Inactive" : "Deleted"}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              className="admin-input pl-9"
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select className="admin-select sm:w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {state.categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="admin-select sm:w-40" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="all">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      </div>

      {!filtered.length ? (
        <AdminEmpty title="No products found" description="Try adjusting filters or add a new product." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const ss = stockStatus(p);
                return (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-[var(--admin-soft)]">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="h-full w-full object-cover transition hover:scale-105" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-[var(--admin-muted)]">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td>{categoryName(p.categoryId)}</td>
                    <td>
                      <div>
                        {p.discountPrice ? (
                          <>
                            <span className="font-medium">{formatINR(p.discountPrice)}</span>
                            <span className="ml-2 text-xs text-[var(--admin-muted)] line-through">
                              {formatINR(p.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">{formatINR(p.price)}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <AdminBadge tone={ss === "in_stock" ? "green" : ss === "low_stock" ? "amber" : "red"}>
                        {p.stock} · {stockLabel(ss)}
                      </AdminBadge>
                    </td>
                    <td>
                      <AdminBadge tone={p.status === "active" ? "green" : p.status === "inactive" ? "neutral" : "red"}>
                        {p.status}
                      </AdminBadge>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {tab === "deleted" ? (
                          <>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                              onClick={() => {
                                restoreProduct(p._id);
                                toast.success("Product restored");
                              }}
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger !py-1.5 !text-xs"
                              onClick={() => {
                                if (confirm("Delete permanently?")) {
                                  hardDeleteProduct(p._id);
                                  toast.success("Product permanently deleted");
                                }
                              }}
                            >
                              Delete Permanently
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                              onClick={() => setEditing(p)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger !py-1.5 !text-xs"
                              onClick={() => {
                                softDeleteProduct(p._id);
                                toast.success("Moved to deleted");
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing ? (
        <ProductForm
          product={editing}
          categories={state.categories}
          collections={state.collections}
          onClose={() => setEditing(null)}
          onSave={(product) => {
            upsertProduct({ ...product, updatedAt: new Date().toISOString() });
            toast.success("Product saved");
            setEditing(null);
          }}
        />
      ) : null}

      {manageMeta ? (
        <MetaDrawer
          categories={state.categories}
          collections={state.collections}
          products={state.products}
          onClose={() => setManageMeta(false)}
        />
      ) : null}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  collections,
  onClose,
  onSave,
}: {
  product: AdminProduct;
  categories: { _id: string; name: string }[];
  collections: { _id: string; name: string }[];
  onClose: () => void;
  onSave: (p: AdminProduct) => void;
}) {
  const [form, setForm] = useState<AdminProduct>(product);
  const [activeTab, setActiveTab] = useState<"general" | "images" | "inventory">("general");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function set<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    set("images", [...form.images, trimmed]);
    setImageUrlInput("");
    toast.success("Image added from URL");
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !files.length) return;
    const fileList = Array.from(files);
    Promise.all(
      fileList.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((uploaded) => {
        const valid = uploaded.filter(Boolean);
        if (valid.length) {
          set("images", [...form.images, ...valid]);
          toast.success(valid.length > 1 ? `${valid.length} images added` : "Image added");
        }
      })
      .catch(() => toast.error("Failed to read image files"));
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const nextImages = [...form.images];
    const [selected] = nextImages.splice(index, 1);
    if (selected) {
      nextImages.unshift(selected);
      set("images", nextImages);
      toast.success("Cover image updated");
    }
  };

  const handleRemoveImage = (index: number) => {
    set(
      "images",
      form.images.filter((_, i) => i !== index),
    );
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="admin-theme fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/75 p-3 backdrop-blur-md sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/80 px-6 py-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Catalog Manager
              </span>
              {form.sku ? (
                <span className="rounded-md bg-stone-200/70 px-2 py-0.5 text-xs font-mono font-medium text-stone-700">
                  #{form.sku}
                </span>
              ) : null}
            </div>
            <h2 className="font-[family-name:var(--font-admin-display)] text-2xl font-semibold text-stone-900">
              {product.name ? `Edit “${product.name}”` : "Add New Product"}
            </h2>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-white px-6">
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "general"
                ? "border-emerald-700 font-semibold text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setActiveTab("general")}
          >
            <FileText className="h-4 w-4" />
            General & Pricing
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "images"
                ? "border-emerald-700 font-semibold text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setActiveTab("images")}
          >
            <ImageIcon className="h-4 w-4" />
            Images & Media
            {form.images.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                {form.images.length}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "inventory"
                ? "border-emerald-700 font-semibold text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            <Package className="h-4 w-4" />
            Inventory & Specs
          </button>
        </div>

        {/* Form Body */}
        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) {
              toast.error("Product name is required");
              setActiveTab("general");
              return;
            }
            onSave(form);
          }}
        >
          <div className="flex-1 overflow-y-auto bg-stone-50/50 p-6 sm:p-8">
            {/* TAB 1: GENERAL & PRICING */}
            {activeTab === "general" && (
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                    Basic Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">
                        Product Name <span className="text-rose-500">*</span>
                      </span>
                      <input
                        className="admin-input font-medium"
                        placeholder="e.g. Handwoven Bamboo Table Lamp"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Category</span>
                      <select
                        className="admin-select"
                        value={form.categoryId}
                        onChange={(e) => set("categoryId", e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">SKU Code</span>
                      <input
                        className="admin-input uppercase"
                        placeholder="e.g. HBL-001"
                        value={form.sku}
                        onChange={(e) => set("sku", e.target.value)}
                      />
                    </label>

                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Short Tagline</span>
                      <input
                        className="admin-input"
                        placeholder="e.g. Eco-friendly handcrafted accent light for warm spaces"
                        value={form.tagline || ""}
                        onChange={(e) => set("tagline", e.target.value)}
                      />
                    </label>

                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Description</span>
                      <textarea
                        className="admin-textarea min-h-28 text-sm"
                        placeholder="Describe the artisan craft, materials, inspiration, and styling suggestions..."
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                    Pricing & Valuation
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">
                        Selling Price (₹) <span className="text-rose-500">*</span>
                      </span>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-stone-400">
                          ₹
                        </span>
                        <input
                          className="admin-input pl-8 font-semibold"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="1499"
                          value={form.price}
                          onChange={(e) => set("price", Number(e.target.value))}
                          required
                        />
                      </div>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">
                        Discount / Compare Price (₹)
                      </span>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-stone-400">
                          ₹
                        </span>
                        <input
                          className="admin-input pl-8"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Original price before discount"
                          value={form.discountPrice ?? ""}
                          onChange={(e) =>
                            set("discountPrice", e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: IMAGES & MEDIA */}
            {activeTab === "images" && (
              <div className="mx-auto max-w-3xl space-y-6">
                {/* Upload & URL Zone */}
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                    Product Imagery
                  </h3>
                  <p className="mb-4 text-xs text-stone-500">
                    High quality photos help customers appreciate the craftmanship. Upload image files or paste image web URLs.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* File Dropzone */}
                    <div
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/70 p-6 text-center transition-colors hover:border-emerald-600 hover:bg-emerald-50/30 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleFileUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-stone-800">Click or browse to upload files</p>
                      <p className="mt-1 text-[11px] text-stone-400">PNG, JPG, WebP up to 10MB</p>
                    </div>

                    {/* Image URL Input */}
                    <div className="flex flex-col justify-center rounded-xl border border-stone-200 bg-stone-50/40 p-5">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Add Image from Web URL</span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          className="admin-input flex-1 text-xs"
                          placeholder="https://images.unsplash.com/..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary !px-3"
                          onClick={handleAddImageUrl}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-stone-400">
                        Paste any online image link and click + to include it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gallery Grid */}
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Gallery ({form.images.length})
                    </h3>
                    {form.images.length > 0 && (
                      <span className="text-xs text-stone-400">First image is the primary storefront cover</span>
                    )}
                  </div>

                  {!form.images.length ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 py-12 text-stone-400">
                      <ImageIcon className="mb-2 h-10 w-10 opacity-40" />
                      <p className="text-sm font-medium">No images uploaded yet</p>
                      <p className="text-xs">Add an image above to showcase this handcrafted piece.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {form.images.map((src, index) => (
                        <div
                          key={`${index}-${src.slice(0, 30)}`}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-xs transition-shadow hover:shadow-md"
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                            {index === 0 ? (
                              <span className="absolute left-2 top-2 rounded-md bg-emerald-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                Primary Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="absolute left-2 top-2 hidden rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs group-hover:block hover:bg-black/80"
                                onClick={() => handleMakeCover(index)}
                              >
                                Set as Cover
                              </button>
                            )}
                            <button
                              type="button"
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm transition-transform hover:scale-110 hover:bg-rose-700"
                              onClick={() => handleRemoveImage(index)}
                              title="Delete photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="bg-white px-2.5 py-1.5 text-center text-[10px] font-mono text-stone-500">
                            Image #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: INVENTORY & SPECS */}
            {activeTab === "inventory" && (
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                    Stock & Availability
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Stock Quantity</span>
                      <input
                        className="admin-input"
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => set("stock", Number(e.target.value))}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Low Stock Alert</span>
                      <input
                        className="admin-input"
                        type="number"
                        min="0"
                        value={form.lowStockThreshold}
                        onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Status</span>
                      <select
                        className="admin-select"
                        value={form.status === "deleted" ? "inactive" : form.status}
                        onChange={(e) => set("status", e.target.value as AdminProduct["status"])}
                      >
                        <option value="active">Active (Visible in store)</option>
                        <option value="inactive">Inactive (Hidden draft)</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                    Artisan Specifications
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Craft Type</span>
                      <select
                        className="admin-select"
                        value={form.craftType}
                        onChange={(e) => set("craftType", e.target.value as CraftType)}
                      >
                        <option value="handwoven">Handwoven</option>
                        <option value="handmade">Handmade</option>
                        <option value="machine-finished">Machine Finished</option>
                      </select>
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Primary Material</span>
                      <input
                        className="admin-input"
                        placeholder="e.g. Natural Bamboo, Rattan, Cane"
                        value={form.material}
                        onChange={(e) => set("material", e.target.value)}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Dimensions</span>
                      <input
                        className="admin-input"
                        placeholder="e.g. 12 x 12 x 18 inches"
                        value={form.dimensions}
                        onChange={(e) => set("dimensions", e.target.value)}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Weight</span>
                      <input
                        className="admin-input"
                        placeholder="e.g. 850 grams"
                        value={form.weight}
                        onChange={(e) => set("weight", e.target.value)}
                      />
                    </label>

                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Color / Finish</span>
                      <input
                        className="admin-input"
                        placeholder="e.g. Natural Warm Honey"
                        value={form.color}
                        onChange={(e) => set("color", e.target.value)}
                      />
                    </label>

                    <div className="flex items-center pt-6">
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded-md border-stone-300 text-emerald-700 focus:ring-emerald-600"
                          checked={form.ecoFriendly}
                          onChange={(e) => set("ecoFriendly", e.target.checked)}
                        />
                        <span className="text-xs font-semibold text-stone-700">100% Eco-friendly / Biodegradable</span>
                      </label>
                    </div>

                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Care Instructions</span>
                      <textarea
                        className="admin-textarea min-h-20 text-sm"
                        placeholder="e.g. Wipe clean with a soft dry cloth. Avoid prolonged exposure to moisture."
                        value={form.careInstructions}
                        onChange={(e) => set("careInstructions", e.target.value)}
                      />
                    </label>

                    <label className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold text-stone-700">Featured Collections</span>
                      <select
                        className="admin-select"
                        multiple
                        value={form.collectionIds}
                        onChange={(e) =>
                          set(
                            "collectionIds",
                            [...e.target.selectedOptions].map((o) => o.value),
                          )
                        }
                      >
                        {collections.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <span className="mt-1 block text-[11px] text-stone-400">
                        Hold Ctrl (or Cmd on Mac) to select multiple collections.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Sticky Footer */}
          <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-4">
            <div className="text-xs text-stone-500">
              {form.name ? (
                <span>
                  Editing: <strong className="text-stone-800">{form.name}</strong>
                </span>
              ) : (
                <span>New catalog item</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="admin-btn admin-btn-ghost text-stone-600 hover:text-stone-900"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Save Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function MetaDrawer({
  categories,
  collections,
  products,
  onClose,
}: {
  categories: { _id: string; name: string; slug: string }[];
  collections: { _id: string; name: string; productIds: string[] }[];
  products: AdminProduct[];
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="admin-theme fixed inset-0 z-[999] flex justify-end bg-stone-950/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-stone-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="font-[family-name:var(--font-admin-display)] text-xl font-bold text-stone-900">
            Categories & Collections
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <section className="mb-6 rounded-2xl border border-[var(--admin-border)] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Categories
          </h3>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c._id} className="flex items-center justify-between rounded-xl bg-[var(--admin-soft)]/70 px-3 py-2 text-sm">
                <span>{c.name}</span>
                <span className="text-xs text-[var(--admin-muted)]">
                  {products.filter((p) => p.categoryId === c._id && p.status !== "deleted").length} products
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Collections
          </h3>
          <ul className="space-y-2">
            {collections.map((c) => (
              <li key={c._id} className="rounded-xl bg-[var(--admin-soft)]/70 px-3 py-2 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-[var(--admin-muted)]">{c.productIds.length} products</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--admin-muted)]">
            Assign collections from the product form. Separate sidebar pages are intentionally avoided.
          </p>
        </section>
      </div>
    </div>,
    document.body,
  );
}
