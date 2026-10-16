import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminSkeleton } from "@/components/admin/AdminUi";
import {
  formatDate,
  formatINR,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import type { OrderStatus } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/orders/$orderId")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "edit" ? ("edit" as const) : ("view" as const),
  }),
  head: () => ({ meta: [{ title: "Order — Admin" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { state, ready, updateOrderStatus, softDeleteOrder, hardDeleteOrder, restoreOrder } =
    useAdminStore();
  const order = state.orders.find((o) => o._id === orderId);
  const editing = mode === "edit";

  if (!ready) {
    return (
      <div className="space-y-4">
        <AdminSkeleton className="h-10 w-48" />
        <AdminSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-fade-in space-y-4">
        <Link to="/admin/orders" className="admin-btn admin-btn-ghost inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <AdminEmpty title="Order not found" />
      </div>
    );
  }

  return (
    <div className="admin-fade-in max-w-4xl">
      <div className="mb-4">
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--admin-primary)]">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>

      <AdminPageHeader
        title={`Order #${order.orderId}`}
        description={editing ? "Update order status and review details" : `Placed ${formatDate(order.createdAt)}`}
        actions={
          <>
            {!editing ? (
              <Link
                to="/admin/orders/$orderId"
                params={{ orderId }}
                search={{ mode: "edit" }}
                className="admin-btn admin-btn-primary"
              >
                Edit
              </Link>
            ) : (
              <Link
                to="/admin/orders/$orderId"
                params={{ orderId }}
                search={{ mode: "view" }}
                className="admin-btn admin-btn-ghost"
              >
                Done
              </Link>
            )}
            {order.orderStatus === "deleted" ? (
              <>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => {
                    restoreOrder(order._id);
                    toast.success("Order restored");
                  }}
                >
                  Restore
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    if (confirm("Delete permanently?")) {
                      hardDeleteOrder(order._id);
                      toast.success("Order permanently deleted");
                      void navigate({ to: "/admin/orders" });
                    }
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => {
                  softDeleteOrder(order._id);
                  toast.success("Moved to recycle bin");
                  void navigate({ to: "/admin/orders" });
                }}
              >
                Delete
              </button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Customer
          </h3>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-[var(--admin-muted)]">{order.customerPhone}</p>
          <p className="text-sm text-[var(--admin-muted)]">{order.customerEmail}</p>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Shipping Address
          </h3>
          <p className="text-sm">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 lg:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Products
          </h3>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.name}`} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-[var(--admin-soft)]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-[var(--admin-muted)]">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatINR(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Payment
          </h3>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>-{formatINR(order.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{formatINR(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>GST</dt>
              <dd>{formatINR(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--admin-border)] pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">
            Payment Status:{" "}
            <AdminBadge tone={order.paymentStatus === "paid" ? "green" : "amber"}>
              {paymentStatusLabel(order.paymentStatus)}
            </AdminBadge>
          </p>
          {editing && order.orderStatus !== "deleted" ? (
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium">Order Status</span>
              <select
                className="admin-select"
                value={order.orderStatus}
                onChange={(e) => {
                  const status = e.target.value as OrderStatus;
                  updateOrderStatus(order._id, status);
                  toast.success(`Status updated to ${orderStatusLabel(status)}`);
                }}
              >
                {(["new", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {orderStatusLabel(s)}
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : (
            <p className="mt-3 text-sm">
              Order Status:{" "}
              <AdminBadge tone="blue">{orderStatusLabel(order.orderStatus)}</AdminBadge>
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            Timeline
          </h3>
          <ol className="space-y-3">
            {order.timeline.map((t, i) => (
              <li key={`${t.label}-${i}`} className="flex gap-3">
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${t.done ? "bg-[var(--admin-primary)]" : "border-2 border-[var(--admin-border)] bg-white"}`}
                />
                <div>
                  <p className={`text-sm ${t.done ? "font-medium" : "text-[var(--admin-muted)]"}`}>
                    {t.label}
                  </p>
                  {t.at ? <p className="text-xs text-[var(--admin-muted)]">{formatDate(t.at)}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
