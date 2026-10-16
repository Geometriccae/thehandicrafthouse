import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminBadge, AdminEmpty, AdminKpiCard, AdminPageHeader } from "@/components/admin/AdminUi";
import { formatDate, formatINR } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { state } = useAdminStore();
  const [status, setStatus] = useState("all");

  const kpis = useMemo(() => {
    const received = state.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const pending = state.payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
    const failed = state.payments.filter((p) => p.status === "failed").reduce((s, p) => s + p.amount, 0);
    const refunded = state.payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);
    return { received, pending, failed, refunded };
  }, [state.payments]);

  const rows = useMemo(() => {
    return [...state.payments]
      .filter((p) => (status === "all" ? true : p.status === status))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [state.payments, status]);

  return (
    <div className="admin-fade-in space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Transaction-level view of received, pending, failed, and refunded payments"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Total Received" value={formatINR(kpis.received)} tone="good" />
        <AdminKpiCard label="Pending" value={formatINR(kpis.pending)} tone="warn" />
        <AdminKpiCard label="Failed" value={formatINR(kpis.failed)} />
        <AdminKpiCard label="Refunded" value={formatINR(kpis.refunded)} tone="gold" />
      </div>

      <div className="admin-tabs">
        {[
          ["all", "All"],
          ["paid", "Paid"],
          ["pending", "Pending"],
          ["failed", "Failed"],
          ["refunded", "Refunded"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="admin-tab"
            data-active={status === key}
            onClick={() => setStatus(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {!rows.length ? (
        <AdminEmpty title="No transactions" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id}>
                  <td className="font-mono text-xs">{p.transactionId}</td>
                  <td>#{p.orderRef}</td>
                  <td>{p.customerName}</td>
                  <td className="font-medium">{formatINR(p.amount)}</td>
                  <td className="capitalize">{p.method}</td>
                  <td>
                    <AdminBadge
                      tone={
                        p.status === "paid"
                          ? "green"
                          : p.status === "failed"
                            ? "red"
                            : p.status === "refunded"
                              ? "neutral"
                              : "amber"
                      }
                    >
                      {p.status}
                    </AdminBadge>
                  </td>
                  <td>{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
