import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
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
              onClick={() => setEditing(createEmptyProduct({ categoryId: state.categories[0]?._id }))}
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
  const [form, setForm] = useState(product);

  function set<K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-[var(--admin-cream)] sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-cream)]/95 px-5 py-4 backdrop-blur">
          <h2 className="font-[family-name:var(--font-admin-display)] text-xl">
            {product.name ? "Edit Product" : "Add Product"}
          </h2>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <form
          className="space-y-6 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return toast.error("Product name is required");
            onSave(form);
          }}
        >
          <section className="space-y-3 rounded-2xl border border-[var(--admin-border)] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
              Product Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium">Product Name</span>
                <input className="admin-input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium">Description</span>
                <textarea
                  className="admin-textarea min-h-24"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Category</span>
                <select className="admin-select" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">SKU</span>
                <input className="admin-input" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Price (₹)</span>
                <input
                  className="admin-input"
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Discount Price (₹)</span>
                <input
                  className="admin-input"
                  type="number"
                  value={form.discountPrice ?? ""}
                  onChange={(e) => set("discountPrice", e.target.value ? Number(e.target.value) : undefined)}
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-[var(--admin-border)] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Images</h3>
            <p className="text-xs text-[var(--admin-muted)]">
              Upload product images from your device. You can select one or more files.
            </p>
            <input
              className="admin-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                Promise.all(
                  files.map(
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
                    const next = uploaded.filter(Boolean);
                    set("images", next.length ? next : form.images);
                    toast.success(next.length > 1 ? "Images uploaded" : "Image uploaded");
                  })
                  .catch(() => toast.error("Failed to read image file"));
                e.target.value = "";
              }}
            />
            {form.images.length ? (
              <div className="flex flex-wrap gap-3">
                {form.images.map((src, index) => (
                  <div key={`${index}-${src.slice(0, 24)}`} className="relative">
                    <img src={src} alt="" className="h-28 w-28 rounded-xl object-cover" />
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                      onClick={() => set("images", form.images.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-3 rounded-2xl border border-[var(--admin-border)] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Inventory</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-medium">Stock Quantity</span>
                <input
                  className="admin-input"
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", Number(e.target.value))}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Low Stock Threshold</span>
                <input
                  className="admin-input"
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => set("lowStockThreshold", Number(e.target.value))}
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-[var(--admin-border)] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
              Product Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-medium">Material</span>
                <input className="admin-input" value={form.material} onChange={(e) => set("material", e.target.value)} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Craft Type</span>
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
                <span className="mb-1 block text-xs font-medium">Dimensions</span>
                <input className="admin-input" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Weight</span>
                <input className="admin-input" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Color</span>
                <input className="admin-input" value={form.color} onChange={(e) => set("color", e.target.value)} />
              </label>
              <label className="flex items-end gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={form.ecoFriendly}
                  onChange={(e) => set("ecoFriendly", e.target.checked)}
                />
                <span className="text-sm">Eco-friendly</span>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium">Care Instructions</span>
                <textarea
                  className="admin-textarea min-h-20"
                  value={form.careInstructions}
                  onChange={(e) => set("careInstructions", e.target.value)}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Status</span>
                <select
                  className="admin-select"
                  value={form.status === "deleted" ? "inactive" : form.status}
                  onChange={(e) => set("status", e.target.value as AdminProduct["status"])}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium">Collections</span>
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
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-2 pb-2">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
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
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-[var(--admin-cream)] p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-admin-display)] text-xl">Categories & Collections</h2>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            Close
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
    </div>
  );
}
