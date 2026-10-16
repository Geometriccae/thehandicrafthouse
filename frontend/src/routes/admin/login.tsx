import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/admin/auth";
import { DEMO_ADMIN } from "@/lib/admin/format";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login — The Handicraft House" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Login failed");
      return;
    }
    void navigate({ to: "/admin/dashboard" });
  }

  return (
    <div className="admin-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--admin-cream)] px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, #eaf4e8 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #f5edd8 0%, transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--admin-border)] bg-white/90 p-8 shadow-[0_20px_50px_-28px_rgb(18_60_42_/_35%)] backdrop-blur admin-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-sidebar)] text-2xl text-[var(--admin-gold)]">
            🎋
          </div>
          <h1 className="font-[family-name:var(--font-admin-display)] text-3xl text-[var(--admin-text)]">
            Handicraft House
          </h1>
          <p className="mt-1 text-sm uppercase tracking-[0.2em] text-[var(--admin-gold)]">
            Admin Portal
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
              Email
            </label>
            <input
              className="admin-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
              Password
            </label>
            <input
              className="admin-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--admin-muted)]">
          Demo: {DEMO_ADMIN.email} / {DEMO_ADMIN.password}
        </p>
      </div>
    </div>
  );
}
