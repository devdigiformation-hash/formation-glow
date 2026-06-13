import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  PoundSterling,
  Wand2,
  Bot,
  ShoppingBag,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import {
  GradientBorderCard,
  ProgressRing,
  NextBestActionCard,
  StatChip,
  MilestoneCard,
  SectionHeader,
} from "@/components/ui-premium";
import {
  useCommissions,
  useGeneratedCreatives,
  useOrders,
  usePartnerProfile,
} from "@/lib/data";
import { deriveJourney, readSoftSignals } from "@/lib/knowledge/journey-kb";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — DigiFormation Affiliate OS" }] }),
  component: Dashboard,
});

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function timeGreeting(): { greeting: string; tone: "morning" | "day" | "evening" } {
  const h = new Date().getHours();
  if (h < 12) return { greeting: "Good morning", tone: "morning" };
  if (h < 18) return { greeting: "Good afternoon", tone: "day" };
  return { greeting: "Good evening", tone: "evening" };
}

function Dashboard() {
  const { totals } = useCommissions();
  const { data: generated } = useGeneratedCreatives();
  const { data: orders } = useOrders();
  const { profile } = usePartnerProfile();

  const { greeting } = timeGreeting();
  const firstName = (profile?.full_name || "Partner").split(" ")[0];

  // 10-step Partner Journey — derived from live signals + soft local flags.
  const soft = typeof window !== "undefined" ? readSoftSignals() : {};
  const checklist = useMemo(() => {
    return deriveJourney({
      profile,
      generatedCount: generated.length,
      ordersCount: orders.length,
      paidCommissions: totals.paid,
      ...soft,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, orders.length, generated.length, totals.paid]);

  const setupPct = useMemo(() => {
    const done = checklist.filter((c) => c.done).length;
    return Math.round((done / checklist.length) * 100);
  }, [checklist]);

  const stepsLeft = checklist.filter((c) => !c.done).length;

  // Next Best Action — first incomplete step from the journey.
  const next =
    checklist.find((c) => !c.done) ?? {
      nbaTitle: "Keep your momentum",
      nbaDescription: "Open Rebrand Studio and ship another creative today.",
      to: "/rebrand-studio",
      icon: Wand2,
    };
  const nextContent = { title: next.nbaTitle, desc: next.nbaDescription };


  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const inProgressOrders = orders.filter(
    (o) => o.status === "in_progress" || o.status === "waiting_documents",
  ).length;

  return (
    <AppLayout
      title={`${greeting}, ${firstName}`}
      subtitle={stepsLeft > 0 ? `${stepsLeft} ${stepsLeft === 1 ? "step" : "steps"} to your full launch` : "You're fully set up — keep shipping creatives."}
    >
      {/* HERO — momentum ring */}
      <GradientBorderCard glow breathe className="animate-rise-in">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] items-center gap-5 sm:gap-7 p-5 sm:p-8">
          <div className="mx-auto sm:mx-0">
            <ProgressRing
              value={setupPct}
              size={180}
              stroke={14}
              label={`${setupPct}%`}
              sublabel="Setup"
            />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              <Sparkles className="h-3 w-3 text-primary" />
              Business Setup
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold leading-tight">
              {stepsLeft > 0 ? `${stepsLeft} ${stepsLeft === 1 ? "step" : "steps"} left to go live` : "You're ready to scale"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your branded business under DigiFormation, in your own voice.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Link
                to="/rebrand-studio"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Wand2 className="h-4 w-4" />
                Open Rebrand Studio
              </Link>
              <Link
                to="/smart-agent"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-border bg-foreground/[0.04] hover:bg-foreground/[0.08]"
              >
                <Bot className="h-4 w-4 text-ai" />
                Ask AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </GradientBorderCard>

      {/* NEXT BEST ACTION */}
      <div className="mt-4 sm:mt-5 animate-rise-in" style={{ animationDelay: "60ms" }}>
        <NextBestActionCard
          icon={<next.icon className="h-5 w-5" />}
          title={nextContent.title}
          description={nextContent.desc}
          ctaLabel="Continue"
          to={next.to}
        />
      </div>

      {/* JOURNEY MILESTONES */}
      <div className="mt-6 sm:mt-7">
        <SectionHeader
          eyebrow="Your journey"
          title="Milestones"
          action={
            <Link to="/build-brand" className="text-xs font-medium text-primary inline-flex items-center gap-1">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto snap-x snap-mandatory">
          <div className="flex gap-3 pb-2">
            {checklist.map((m, i) => (
              <div key={m.key} className="animate-rise-in" style={{ animationDelay: `${80 + i * 40}ms` }}>
                <MilestoneCard icon={m.icon} label={m.label} done={m.done} to={m.to} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="mt-6 sm:mt-7">
        <SectionHeader eyebrow="At a glance" title="This month" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatChip label="Lifetime" value={gbp(totals.lifetime)} tone="signal" />
          <StatChip label="Pending" value={gbp(totals.pending)} />
          <StatChip label="Active" value={String(inProgressOrders)} tone="ai" />
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-6 sm:mt-7">
        <SectionHeader eyebrow="Recent" title="Activity" />
        {orders.length === 0 && generated.length === 0 ? (
          <div className="rounded-2xl glass p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No activity yet — generate your first rebrand to kick things off.
            </p>
            <Link
              to="/rebrand-studio"
              className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Wand2 className="h-4 w-4" /> Start Rebranding
            </Link>
          </div>
        ) : (
          <ul className="rounded-2xl glass divide-y divide-border/60 overflow-hidden">
            {orders.slice(0, 2).map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{o.service_name_snapshot ?? "Order"}</div>
                  <div className="text-xs text-muted-foreground truncate">Status: {o.status.replace(/_/g, " ")}</div>
                </div>
                <div className="text-xs tabular text-muted-foreground shrink-0 capitalize">
                  {o.status.replace(/_/g, " ")}
                </div>
              </li>
            ))}
            {generated.slice(0, 2).map((g) => (
              <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ai/15 text-ai">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">Rebrand bundle generated</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(g.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FOOTER COMPLETION INDICATOR */}
      <div className="mt-6 sm:mt-7 flex items-center gap-2 text-xs text-muted-foreground">
        <PoundSterling className="h-3.5 w-3.5 text-signal" />
        {totals.paid > 0
          ? `You've earned ${gbp(totals.paid)} so far — keep going.`
          : "Your earnings will start appearing here as orders complete."}
      </div>
    </AppLayout>
  );
}
