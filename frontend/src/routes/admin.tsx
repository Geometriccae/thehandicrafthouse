import { Navigate, Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/lib/admin/auth";
import { AdminSkeleton } from "@/components/admin/AdminUi";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    // `/admin` and `/admin/` should open login (hosted deep-links)
    const path = location.pathname.replace(/\/$/, "") || "/";
    if (path === "/admin") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { ready, session } = useAdminAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  // Always render login immediately — never block it behind a loading gate
  if (isLogin) {
    if (ready && session) return <Navigate to="/admin/dashboard" replace />;
    return <Outlet />;
  }

  if (!ready) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-[var(--admin-cream)]">
        <div className="w-full max-w-sm space-y-3 p-6">
          <AdminSkeleton className="h-10 w-40" />
          <AdminSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
