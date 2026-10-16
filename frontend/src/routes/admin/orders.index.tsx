import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/AdminUi";
import {
  formatDate,
  formatINR,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/orders/")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: OrdersPage,
});

type Tab = "all" | "new" | "processing" | "shipped" | "delivered" | "cancelled" | "deleted";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "deleted", label: "Recycle Bin" },
];

function OrdersPage() {
  const { state, softDeleteOrder, restoreOrder, hardDeleteOrder } = useAdminStore();
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    return [...state.orders]
      .filter((o) => {
        if (tab === "all") return o.orderStatus !== "deleted";
        return o.orderStatus === tab;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [state.orders, tab]);

  return (
    <div className="admin-fade-in">
      <AdminPageHeader title="Orders" description="Track fulfillment, payments, and shipping" />

      <div className="mb-4 admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className="admin-tab"
            data-active={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <AdminEmpty title="No orders in this tab" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id}>
                  <td className="font-medium">#{o.orderId}</td>
                  <td>{o.customerName}</td>
                  <td>{o.items.reduce((s, i) => s + i.quantity, 0)} Items</td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <AdminBadge
                      tone={
                        o.paymentStatus === "paid"
                          ? "green"
                          : o.paymentStatus === "failed"
                            ? "red"
                            : o.paymentStatus === "refunded"
                              ? "neutral"
                              : "amber"
                      }
                    >
                      {paymentStatusLabel(o.paymentStatus)}
                    </AdminBadge>
                  </td>
                  <td>
                    <AdminBadge
                      tone={
                        o.orderStatus === "delivered"
                          ? "green"
                          : o.orderStatus === "cancelled" || o.orderStatus === "deleted"
                            ? "red"
                            : "blue"
                      }
                    >
                      {orderStatusLabel(o.orderStatus)}
                    </AdminBadge>
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/admin/orders/$orderId"
                        params={{ orderId: o._id }}
                        search={{ mode: "view" }}
                        className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                      >
                        View
                      </Link>
                      {tab === "deleted" ? (
                        <>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                            onClick={() => {
                              restoreOrder(o._id);
                              toast.success("Order restored");
                            }}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger !py-1.5 !text-xs"
                            onClick={() => {
                              if (confirm("Delete permanently?")) {
                                hardDeleteOrder(o._id);
                                toast.success("Order permanently deleted");
                              }
                            }}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/admin/orders/$orderId"
                            params={{ orderId: o._id }}
                            search={{ mode: "edit" }}
                            className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger !py-1.5 !text-xs"
                            onClick={() => {
                              softDeleteOrder(o._id);
                              toast.success("Moved to recycle bin");
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
