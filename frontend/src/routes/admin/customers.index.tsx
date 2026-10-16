import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminBadge, AdminEmpty, AdminPageHeader } from "@/components/admin/AdminUi";
import { formatINR } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/customers/")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { state, getCustomerStats, deleteCustomer } = useAdminStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return state.customers
      .filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()))
      .map((c) => ({ customer: c, stats: getCustomerStats(c._id) }));
  }, [state.customers, q, getCustomerStats]);

  return (
    <div className="admin-fade-in">
      <AdminPageHeader title="Customers" description="Customer list with spend and order history" />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
        <input
          className="admin-input pl-9"
          placeholder="Search customer..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {!rows.length ? (
        <AdminEmpty title="No customers found" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ customer, stats }) => (
                <tr key={customer._id}>
                  <td>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-[var(--admin-muted)]">{customer.phone}</p>
                  </td>
                  <td>{customer.email}</td>
                  <td>{stats.orders}</td>
                  <td className="font-medium">{formatINR(stats.spent)}</td>
                  <td>
                    <AdminBadge tone={customer.status === "active" ? "green" : "neutral"}>
                      {customer.status}
                    </AdminBadge>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/admin/customers/$customerId"
                        params={{ customerId: customer._id }}
                        search={{ mode: "view" }}
                        className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                      >
                        View
                      </Link>
                      <Link
                        to="/admin/customers/$customerId"
                        params={{ customerId: customer._id }}
                        search={{ mode: "edit" }}
                        className="admin-btn admin-btn-ghost !py-1.5 !text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger !py-1.5 !text-xs"
                        onClick={() => {
                          if (confirm(`Delete customer "${customer.name}"?`)) {
                            deleteCustomer(customer._id);
                            toast.success("Customer deleted");
                          }
                        }}
                      >
                        Delete
                      </button>
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
