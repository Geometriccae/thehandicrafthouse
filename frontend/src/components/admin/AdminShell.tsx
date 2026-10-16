import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import { cn } from "@/lib/utils";

const NAV = [
  {
    group: "Main",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Store",
    items: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    group: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    group: "Customers",
    items: [{ to: "/admin/customers", label: "Customers", icon: Users }],
  },
  {
    group: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAdminAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-theme flex min-h-screen bg-[var(--admin-cream)] text-[var(--admin-text)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[var(--admin-sidebar)] text-[var(--admin-sidebar-fg)] transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="font-[family-name:var(--font-admin-display)] text-xl tracking-wide text-white">
              Handicraft House
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-[var(--admin-gold)]">
              Admin Portal
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((section) => (
            <div key={section.group} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {section.group}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-[var(--admin-primary)] text-white shadow-sm"
                            : "text-white/75 hover:bg-white/8 hover:text-white",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 px-3 py-2.5">
            <p className="text-sm font-medium text-white">{session?.name ?? "Admin"}</p>
            <p className="truncate text-xs text-white/50">{session?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-cream)]/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-xl border border-[var(--admin-border)] bg-white p-2 text-[var(--admin-text)] lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-[var(--admin-muted)]">
              Manage products, orders, and inventory
            </p>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
