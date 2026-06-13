// Premium design primitives for the partner OS.
// Pure presentation — no data fetching, no side effects.
// Used across Dashboard, Rebrand Studio, Profile, Marketing Guide, etc.

import { type ReactNode, type ElementType } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ChevronRight, Check } from "lucide-react";

// ---------- ProgressRing ----------------------------------------------------
// Animated circular progress. Stroke is the signature brand gradient by default.
export function ProgressRing({
  value,
  size = 160,
  stroke = 12,
  label,
  sublabel,
  variant = "brand",
  className,
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  variant?: "brand" | "signal";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const gradId = `pr-grad-${variant}`;
  const stops =
    variant === "signal"
      ? [
          { o: "0%", c: "#34d399" },
          { o: "100%", c: "#22d3ee" },
        ]
      : [
          { o: "0%", c: "#22d3ee" },
          { o: "100%", c: "#a78bfa" },
        ];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            {stops.map((s) => (
              <stop key={s.o} offset={s.o} stopColor={s.c} />
            ))}
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="animate-ring-fill"
          style={
            {
              "--ring-circumference": c,
              "--ring-target": offset,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        {label && (
          <div className="font-display text-3xl font-bold tabular tracking-tight leading-none">
            {label}
          </div>
        )}
        {sublabel && (
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- GradientBorderCard ---------------------------------------------
// Glass surface + gradient border. Optional ambient glow behind the card.
export function GradientBorderCard({
  children,
  className,
  glow = false,
  breathe = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  breathe?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {glow && (
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-[2rem] opacity-50 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
      )}
      <div
        className={cn(
          "relative rounded-3xl glass-strong gradient-border-brand overflow-hidden",
          breathe && "animate-breathing-glow",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ---------- NextBestActionCard ---------------------------------------------
export function NextBestActionCard({
  icon,
  title,
  description,
  ctaLabel,
  to,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  to: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl glass-strong">
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="p-5 sm:p-6 pl-6 sm:pl-7">
        <div className="flex items-start gap-3">
          <div className="shrink-0 grid h-11 w-11 place-items-center rounded-2xl bg-foreground/[0.05] text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Next best action
            </div>
            <h3 className="mt-0.5 font-display text-lg sm:text-xl font-semibold leading-tight">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link
          to={to}
          className="mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-brand-glow)] transition-transform active:scale-[0.98]"
          style={{ background: "var(--gradient-brand)" }}
        >
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ---------- StatChip --------------------------------------------------------
export function StatChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "signal" | "ai";
}) {
  const valColor = {
    default: "text-foreground",
    signal: "text-signal",
    ai: "text-ai",
  }[tone];
  return (
    <div className="rounded-2xl glass p-3 sm:p-4 min-w-0">
      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium truncate">
        {label}
      </div>
      <div className={cn("mt-1 font-display text-lg sm:text-2xl font-bold tabular tracking-tight truncate", valColor)}>
        {value}
      </div>
    </div>
  );
}

// ---------- MilestoneCard ---------------------------------------------------
export function MilestoneCard({
  icon: Icon,
  label,
  done,
  to,
}: {
  icon: ElementType;
  label: string;
  done: boolean;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "shrink-0 snap-start w-[140px] rounded-2xl glass p-3 transition-transform active:scale-[0.98]",
        done && "ring-1 ring-signal/40",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl",
            done ? "bg-signal/15 text-signal" : "bg-foreground/[0.06] text-muted-foreground",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {done ? (
          <Check className="h-4 w-4 text-signal" strokeWidth={2.5} />
        ) : (
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        )}
      </div>
      <div className="mt-3 text-sm font-semibold leading-tight truncate">{label}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {done ? "Complete" : "Pending"}
      </div>
    </Link>
  );
}

// ---------- SectionHeader ---------------------------------------------------
export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 mb-3 sm:mb-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-base sm:text-lg font-semibold truncate">
          {title}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ---------- CopyChip (visual only, copy handled by parent) ------------------
export function CopyChip({
  label = "Copy",
  copied,
  onClick,
  className,
}: {
  label?: string;
  copied?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all active:scale-[0.96]",
        copied
          ? "border-signal/40 bg-signal/10 text-signal"
          : "border-border bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]",
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : null}
      {copied ? "Copied" : label}
    </button>
  );
}
