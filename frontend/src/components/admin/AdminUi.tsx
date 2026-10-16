import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-admin-display)] text-2xl tracking-tight text-[var(--admin-text)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--admin-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminKpiCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warn" | "good" | "gold";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "admin-card admin-fade-in rounded-2xl border border-[var(--admin-border)] bg-white p-4 sm:p-5",
        tone === "warn" && "border-amber-200/80 bg-amber-50/50",
        tone === "good" && "border-emerald-200/80 bg-emerald-50/40",
        tone === "gold" && "border-[var(--admin-gold)]/30 bg-[var(--admin-gold-soft)]",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--admin-muted)]">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-admin-display)] text-2xl text-[var(--admin-text)] sm:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--admin-muted)]">{hint}</p> : null}
    </div>
  );
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue" | "gold";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-[var(--admin-cream)] text-[var(--admin-muted)]",
        tone === "green" && "bg-emerald-100 text-emerald-800",
        tone === "amber" && "bg-amber-100 text-amber-900",
        tone === "red" && "bg-rose-100 text-rose-800",
        tone === "blue" && "bg-sky-100 text-sky-800",
        tone === "gold" && "bg-[var(--admin-gold-soft)] text-[var(--admin-sidebar)]",
      )}
    >
      {children}
    </span>
  );
}

export function AdminEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-white/60 px-6 py-14 text-center">
      <p className="font-medium text-[var(--admin-text)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--admin-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

export function AdminSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-[var(--admin-soft)]", className)} />
  );
}
