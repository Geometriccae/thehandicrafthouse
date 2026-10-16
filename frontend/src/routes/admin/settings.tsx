import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import { useAdminStore } from "@/lib/admin/store";
import type { AdminSettings } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

type Tab = "store" | "admin" | "shipping" | "payment" | "notifications";

const TABS: { key: Tab; label: string }[] = [
  { key: "store", label: "Store" },
  { key: "admin", label: "Admin Profile" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "notifications", label: "Notifications" },
];

function SettingsPage() {
  const { state, updateSettings, resetSeed } = useAdminStore();
  const [tab, setTab] = useState<Tab>("store");
  const [form, setForm] = useState<AdminSettings>(state.settings);

  function save() {
    updateSettings(form);
    toast.success("Settings saved");
  }

  return (
    <div className="admin-fade-in">
      <AdminPageHeader
        title="Settings"
        description="Store, shipping, payment, and notification preferences"
        actions={
          <>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => {
                if (confirm("Reset admin demo data to seed?")) {
                  resetSeed();
                  window.location.reload();
                }
              }}
            >
              Reset Demo Data
            </button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={save}>
              Save Changes
            </button>
          </>
        }
      />

      <div className="mb-5 admin-tabs">
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

      <div className="max-w-2xl rounded-2xl border border-[var(--admin-border)] bg-white p-5">
        {tab === "store" ? (
          <div className="space-y-3">
            {(
              [
                ["name", "Store Name"],
                ["email", "Store Email"],
                ["phone", "Phone"],
                ["address", "Address"],
                ["currency", "Currency"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-medium">{label}</span>
                <input
                  className="admin-input"
                  value={form.store[key]}
                  onChange={(e) => setForm({ ...form, store: { ...form.store, [key]: e.target.value } })}
                />
              </label>
            ))}
          </div>
        ) : null}

        {tab === "admin" ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Admin Name</span>
              <input
                className="admin-input"
                value={form.admin.name}
                onChange={(e) => setForm({ ...form, admin: { ...form.admin, name: e.target.value } })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Admin Email</span>
              <input
                className="admin-input"
                value={form.admin.email}
                onChange={(e) => setForm({ ...form, admin: { ...form.admin, email: e.target.value } })}
              />
            </label>
          </div>
        ) : null}

        {tab === "shipping" ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Free shipping above (₹)</span>
              <input
                className="admin-input"
                type="number"
                value={form.shipping.freeAbove}
                onChange={(e) =>
                  setForm({ ...form, shipping: { ...form.shipping, freeAbove: Number(e.target.value) } })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Flat rate (₹)</span>
              <input
                className="admin-input"
                type="number"
                value={form.shipping.flatRate}
                onChange={(e) =>
                  setForm({ ...form, shipping: { ...form.shipping, flatRate: Number(e.target.value) } })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Estimated delivery</span>
              <input
                className="admin-input"
                value={form.shipping.estimatedDays}
                onChange={(e) =>
                  setForm({ ...form, shipping: { ...form.shipping, estimatedDays: e.target.value } })
                }
              />
            </label>
          </div>
        ) : null}

        {tab === "payment" ? (
          <div className="space-y-3">
            {(
              [
                ["razorpayEnabled", "Razorpay"],
                ["upiEnabled", "UPI"],
                ["codEnabled", "Cash on Delivery"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl bg-[var(--admin-soft)]/70 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.payment[key]}
                  onChange={(e) =>
                    setForm({ ...form, payment: { ...form.payment, [key]: e.target.checked } })
                  }
                />
                Enable {label}
              </label>
            ))}
          </div>
        ) : null}

        {tab === "notifications" ? (
          <div className="space-y-3">
            {(
              [
                ["newOrderEmail", "Email on new order"],
                ["lowStockEmail", "Email on low stock"],
                ["paymentFailedEmail", "Email on payment failure"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl bg-[var(--admin-soft)]/70 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.notifications[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notifications: { ...form.notifications, [key]: e.target.checked },
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
