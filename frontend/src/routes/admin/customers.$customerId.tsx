import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminSkeleton } from "@/components/admin/AdminUi";
import { formatDate, formatINR } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import type { AdminCustomer, CustomerStatus } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/customers/$customerId")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "edit" ? ("edit" as const) : ("view" as const),
  }),
  head: () => ({ meta: [{ title: "Customer — Admin" }] }),
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { state, ready, getCustomerStats, upsertCustomer, deleteCustomer } = useAdminStore();
  const customer = state.customers.find((c) => c._id === customerId);
  const editing = mode === "edit";
  const [form, setForm] = useState<AdminCustomer | null>(customer ?? null);

  useEffect(() => {
    if (customer) setForm(customer);
  }, [customer, mode]);

  if (!ready) {
    return (
      <div className="space-y-4">
        <AdminSkeleton className="h-10 w-48" />
        <AdminSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="admin-fade-in space-y-4">
        <Link to="/admin/customers" className="admin-btn admin-btn-ghost inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <AdminEmpty title="Customer not found" description="This customer may have been deleted." />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="space-y-4">
        <AdminSkeleton className="h-10 w-48" />
        <AdminSkeleton className="h-64 w-full" />
      </div>
    );
  }

  const stats = getCustomerStats(customer._id);
  const orders = state.orders.filter(
    (o) => o.customerId === customer._id && o.orderStatus !== "deleted",
  );
  const wishlist = state.products.filter((p) => customer.wishlistProductIds.includes(p._id));

  return (
    <div className="admin-fade-in max-w-4xl">
      <div className="mb-4">
        <Link to="/admin/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--admin-primary)]">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
      </div>

      <AdminPageHeader
        title={editing ? "Edit Customer" : "Customer Profile"}
        description={editing ? "Update customer details" : customer.email}
        actions={
          <>
            {!editing ? (
              <Link
                to="/admin/customers/$customerId"
                params={{ customerId }}
                search={{ mode: "edit" }}
                className="admin-btn admin-btn-primary"
              >
                Edit
              </Link>
            ) : (
              <Link
                to="/admin/customers/$customerId"
                params={{ customerId }}
                search={{ mode: "view" }}
                className="admin-btn admin-btn-ghost"
              >
                Cancel
              </Link>
            )}
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={() => {
                if (confirm(`Delete customer "${customer.name}"?`)) {
                  deleteCustomer(customer._id);
                  toast.success("Customer deleted");
                  void navigate({ to: "/admin/customers" });
                }
              }}
            >
              Delete
            </button>
          </>
        }
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium">Name</span>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium">Email</span>
                <input
                  className="admin-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium">Phone</span>
                <input
                  className="admin-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium">Status</span>
                <select
                  className="admin-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    if (!form.name.trim() || !form.email.trim()) {
                      toast.error("Name and email are required");
                      return;
                    }
                    upsertCustomer(form);
                    toast.success("Customer updated");
                    void navigate({
                      to: "/admin/customers/$customerId",
                      params: { customerId },
                      search: { mode: "view" },
                    });
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-medium">{customer.name}</p>
                  <p className="text-sm text-[var(--admin-muted)]">{customer.email}</p>
                  <p className="text-sm text-[var(--admin-muted)]">{customer.phone}</p>
                  <p className="mt-2 text-xs text-[var(--admin-muted)]">
                    Joined {formatDate(customer.joinedAt)}
                  </p>
                </div>
                <AdminBadge tone={customer.status === "active" ? "green" : "neutral"}>
                  {customer.status}
                </AdminBadge>
              </div>
            </>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--admin-soft)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">Total Orders</p>
              <p className="text-2xl font-semibold">{stats.orders}</p>
            </div>
            <div className="rounded-xl bg-[var(--admin-soft)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">Total Spent</p>
              <p className="text-2xl font-semibold">{formatINR(stats.spent)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Recent Orders
          </h3>
          <ul className="space-y-2">
            {orders.slice(0, 8).map((o) => (
              <li key={o.orderId}>
                <Link
                  to="/admin/orders/$orderId"
                  params={{ orderId: o._id }}
                  search={{ mode: "view" }}
                  className="flex items-center justify-between rounded-xl bg-[var(--admin-soft)]/60 px-3 py-2.5 text-sm transition hover:bg-[var(--admin-soft)]"
                >
                  <span>#{o.orderId}</span>
                  <span className="font-medium">{formatINR(o.total)}</span>
                </Link>
              </li>
            ))}
            {!orders.length ? (
              <li className="text-sm text-[var(--admin-muted)]">No orders yet</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Addresses
          </h3>
          <ul className="space-y-2">
            {customer.addresses.map((a) => (
              <li key={a.id} className="rounded-xl bg-[var(--admin-soft)]/60 px-3 py-2.5 text-sm">
                <p className="font-medium">{a.label}</p>
                <p className="text-[var(--admin-muted)]">
                  {a.line1}, {a.city}, {a.state} {a.pincode}
                </p>
              </li>
            ))}
            {!customer.addresses.length ? (
              <li className="text-sm text-[var(--admin-muted)]">No saved addresses</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Wishlist
          </h3>
          <ul className="space-y-2">
            {wishlist.map((p) => (
              <li
                key={p._id}
                className="flex items-center gap-3 rounded-xl bg-[var(--admin-soft)]/60 px-3 py-2.5 text-sm"
              >
                {p.images[0] ? (
                  <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : null}
                {p.name}
              </li>
            ))}
            {!wishlist.length ? (
              <li className="text-sm text-[var(--admin-muted)]">Wishlist is empty</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
