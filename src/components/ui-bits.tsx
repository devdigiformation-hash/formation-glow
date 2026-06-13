import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon,
  variant = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: ReactNode;
  variant?: "primary" | "ai" | "success" | "warning";
}) {
  const ring = {
    primary: "var(--shadow-glow)",
    ai: "var(--shadow-ai-glow)",
    success: "0 0 40px -10px oklch(0.75 0.17 155 / 0.4)",
    warning: "0 0 40px -10px oklch(0.82 0.17 80 / 0.4)",
  }[variant];

  const iconBg = {
    primary: "bg-primary/15 text-primary",
    ai: "bg-ai/15 text-ai",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  }[variant];

  return (
    <div className="relative rounded-2xl p-4 sm:p-5 glass overflow-hidden">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-30 blur-3xl" style={{ boxShadow: ring, background: variant === "ai" ? "var(--color-ai)" : "var(--color-primary)" }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight">{value}</div>
          {delta && (
            <div className="mt-1.5 text-xs text-success font-medium">{delta}</div>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl glass p-5 sm:p-6", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PlaceholderHero({
  title,
  description,
  icon,
  ai,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  ai?: boolean;
}) {
  return (
    <div className="rounded-3xl p-8 sm:p-10 glass-strong relative overflow-hidden">
      <div
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: ai ? "var(--gradient-ai)" : "var(--gradient-primary)" }}
      />
      <div className="relative">
        <div
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4",
            ai ? "bg-ai/15 text-ai" : "bg-primary/15 text-primary"
          )}
        >
          {icon}
        </div>
        <h2 className={cn("font-display text-2xl sm:text-3xl font-semibold", ai ? "gradient-text-ai" : "gradient-text")}>
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>
    </div>
  );
}
