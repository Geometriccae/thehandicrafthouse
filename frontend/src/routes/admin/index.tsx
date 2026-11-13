import { createFileRoute, redirect } from "@tanstack/react-router";
import { readAdminSession } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    const session = readAdminSession();
    if (session) {
      throw redirect({ to: "/admin/dashboard" });
    }
    throw redirect({ to: "/admin/login" });
  },
});
