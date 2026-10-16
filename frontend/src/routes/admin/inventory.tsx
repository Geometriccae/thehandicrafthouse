import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminBadge, AdminEmpty, AdminKpiCard, AdminPageHeader } from "@/components/admin/AdminUi";
import { formatDateTime, stockLabel, stockStatus } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Admin" }] }),
  component: InventoryPage,
});

type Filter = "all" | "in_stock" | "low_stock" | "out_of_stock";

function InventoryPage() {
  const { state, updateStock } = useAdminStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStock, setDraftStock] = useState(0);
  const [draftThreshold, setDraftThreshold] = useState(5);

  const products = useMemo(
    () => state.products.filter((p) => p.status !== "deleted"),
    [state.products],
  );

  const kpis = useMemo(() => {
    const inStock = products.filter((p) => stockStatus(p) === "in_stock").length;
    const low = products.filter((p) => stockStatus(p) === "low_stock").length;
    const out = products.filter((p) => stockStatus(p) === "out_of_stock").length;
    return { total: products.length, inStock, low, out };
  }, [products]);

  const lowAlerts = products.filter((p) => stockStatus(p) !== "in_stock").slice(0, 6);

  const filtered = products
    .filter((p) => (filter === "all" ? true : stockStatus(p) === filter))
    .filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="admin-fade-in space-y-6">
      <AdminPageHeader title="Inventory" description="Track stock levels and low-stock alerts" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Total Products" value={kpis.total} />
        <AdminKpiCard label="In Stock" value={kpis.inStock} tone="good" />
        <AdminKpiCard label="Low Stock" value={kpis.low} tone="warn" />
        <AdminKpiCard label="Out of Stock" value={kpis.out} tone={kpis.out ? "warn" : "default"} />
      </div>

      <div className="admin-card rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5">
        <h2 className="mb-3 font-[family-name:var(--font-admin-display)] text-xl">⚠ Low Stock</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lowAlerts.map((p) => (
            <div key={p._id} className="rounded-xl bg-white/80 px-3 py-2.5">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-amber-900">{p.stock} remaining</p>
            </div>
          ))}
          {!lowAlerts.length ? (
            <p className="text-sm text-[var(--admin-muted)]">No low-stock items right now.</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="admin-tabs">
          {(
            [
              ["all", "All"],
              ["in_stock", "In Stock"],
              ["low_stock", "Low Stock"],
              ["out_of_stock", "Out of Stock"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="admin-tab"
              data-active={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            className="admin-input pl-9"
            placeholder="Search inventory..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {!filtered.length ? (
        <AdminEmpty title="No inventory rows" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Low Stock Level</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const ss = stockStatus(p);
                const editing = editingId === p._id;
                return (
                  <tr key={p._id}>
                    <td className="font-medium">{p.name}</td>
                    <td className="text-[var(--admin-muted)]">{p.sku}</td>
                    <td>
                      {editing ? (
                        <input
                          className="admin-input w-24"
                          type="number"
                          value={draftStock}
                          onChange={(e) => setDraftStock(Number(e.target.value))}
                        />
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          className="admin-input w-24"
                          type="number"
                          value={draftThreshold}
                          onChange={(e) => setDraftThreshold(Number(e.target.value))}
                        />
                      ) : (
                        p.lowStockThreshold
                      )}
                    </td>
                    <td>
                      <AdminBadge tone={ss === "in_stock" ? "green" : ss === "low_stock" ? "amber" : "red"}>
                        {stockLabel(ss)}
                      </AdminBadge>
                    </td>
                    <td>{formatDateTime(p.updatedAt)}</td>
                    <td>
                      {editing ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary !py-1.5 !text-xs"
                            onClick={() => {
                              updateStock(p._id, draftStock, draftThreshold);
                              setEditingId(null);
                              toast.success("Stock updated");
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                          onClick={() => {
                            setEditingId(p._id);
                            setDraftStock(p.stock);
                            setDraftThreshold(p.lowStockThreshold);
                          }}
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
