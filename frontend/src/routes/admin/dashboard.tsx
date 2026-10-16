import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminBadge, AdminKpiCard, AdminPageHeader } from "@/components/admin/AdminUi";
import { formatDate, formatINR, orderStatusLabel, stockStatus } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import type { DateRangeKey } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: DashboardPage,
});

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

function inRange(iso: string, range: DateRangeKey) {
  const d = new Date(iso);
  const now = new Date("2026-08-10T23:59:59+05:30");
  if (range === "7d") return d >= new Date(now.getTime() - 7 * 86400000);
  if (range === "30d") return d >= new Date(now.getTime() - 30 * 86400000);
  if (range === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (range === "year") return d.getFullYear() === now.getFullYear();
  return true;
}

function DashboardPage() {
  const { state, ready } = useAdminStore();
  const [range, setRange] = useState<DateRangeKey>("30d");

  const stats = useMemo(() => {
    const activeProducts = state.products.filter((p) => p.status !== "deleted");
    const liveOrders = state.orders.filter((o) => o.orderStatus !== "deleted");
    const ranged = liveOrders.filter((o) => inRange(o.createdAt, range));
    const revenue = ranged
      .filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered")
      .reduce((s, o) => s + o.total, 0);
    const pending = liveOrders.filter((o) => o.orderStatus === "new" || o.orderStatus === "processing").length;
    const lowStock = activeProducts.filter((p) => stockStatus(p) === "low_stock" || stockStatus(p) === "out_of_stock");
    const today = liveOrders.filter((o) => inRange(o.createdAt, "7d") && new Date(o.createdAt).toDateString() === new Date("2026-08-10").toDateString());

    const chartMap = new Map<string, number>();
    ranged.forEach((o) => {
      const key = formatDate(o.createdAt);
      chartMap.set(key, (chartMap.get(key) ?? 0) + o.total);
    });
    const chart = [...chartMap.entries()].map(([name, value]) => ({ name, value }));

    const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
    liveOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cur = productSales.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
        cur.qty += item.quantity;
        cur.revenue += item.price * item.quantity;
        productSales.set(item.productId, cur);
      });
    });
    const topProducts = [...productSales.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    return {
      totalOrders: liveOrders.length,
      revenue,
      pending,
      customers: state.customers.length,
      products: activeProducts.length,
      lowStockCount: lowStock.length,
      todayOrders: today.length,
      monthRevenue: liveOrders
        .filter((o) => inRange(o.createdAt, "month") && o.paymentStatus === "paid")
        .reduce((s, o) => s + o.total, 0),
      chart,
      recent: [...liveOrders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5),
      topProducts,
      lowStock: lowStock.slice(0, 5),
    };
  }, [state, range]);

  if (!ready) return null;

  return (
    <div className="admin-fade-in space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of store performance and alerts"
        actions={
          <div className="admin-tabs">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                className="admin-tab"
                data-active={range === r.key}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Total Orders" value={stats.totalOrders} />
        <AdminKpiCard label="Revenue" value={formatINR(stats.revenue)} tone="gold" hint={`Range: ${RANGES.find((r) => r.key === range)?.label}`} />
        <AdminKpiCard label="Pending" value={stats.pending} tone="warn" />
        <AdminKpiCard label="Customers" value={stats.customers} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Total Products" value={stats.products} />
        <AdminKpiCard label="Low Stock" value={stats.lowStockCount} tone={stats.lowStockCount ? "warn" : "good"} />
        <AdminKpiCard label="Today's Orders" value={stats.todayOrders} />
        <AdminKpiCard label="This Month Revenue" value={formatINR(stats.monthRevenue)} tone="good" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="admin-card rounded-2xl border border-[var(--admin-border)] bg-white p-5 xl:col-span-2">
          <h2 className="mb-4 font-[family-name:var(--font-admin-display)] text-xl">Sales Overview</h2>
          <div className="h-64">
            {stats.chart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chart}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3F7D4A" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3F7D4A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e0d4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5f6f64" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5f6f64" }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Area type="monotone" dataKey="value" stroke="#3F7D4A" fill="url(#salesFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-[var(--admin-muted)]">
                No sales in this range
              </p>
            )}
          </div>
        </div>

        <div className="admin-card rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-admin-display)] text-xl">Low Stock Alert</h2>
          <ul className="space-y-3">
            {stats.lowStock.map((p) => (
              <li key={p._id} className="rounded-xl bg-amber-50/80 px-3 py-2.5">
                <p className="text-sm font-medium text-[var(--admin-text)]">⚠ {p.name}</p>
                <p className="text-xs text-amber-800">
                  Only {p.stock} left
                </p>
              </li>
            ))}
            {!stats.lowStock.length ? (
              <li className="text-sm text-[var(--admin-muted)]">All products are healthy.</li>
            ) : null}
          </ul>
          <Link to="/admin/inventory" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-primary)]">
            View inventory →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="admin-card rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-admin-display)] text-xl">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-[var(--admin-primary)]">
              View all
            </Link>
          </div>
          <div className="admin-table-wrap border-0">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((o) => (
                  <tr key={o._id}>
                    <td className="font-medium">#{o.orderId}</td>
                    <td>{o.customerName}</td>
                    <td>{formatINR(o.total)}</td>
                    <td>
                      <AdminBadge
                        tone={
                          o.orderStatus === "delivered"
                            ? "green"
                            : o.orderStatus === "cancelled"
                              ? "red"
                              : o.orderStatus === "new"
                                ? "gold"
                                : "blue"
                        }
                      >
                        {orderStatusLabel(o.orderStatus)}
                      </AdminBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-admin-display)] text-xl">Top Selling Products</h2>
          <ul className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--admin-soft)]/60 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {i + 1}. {p.name}
                  </p>
                  <p className="text-xs text-[var(--admin-muted)]">{p.qty} sold</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatINR(p.revenue)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
