import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Briefcase, Megaphone, Wand2, Search, TrendingUp,
  Info, CheckCircle2, Clock, HelpCircle, MessageCircle, Sparkles, Hash, Check, ChevronDown,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatPrice } from "@/lib/commission";
import { useServices } from "@/lib/data";
import { cn } from "@/lib/utils";
import { findServiceKnowledgeByName, type ServiceKnowledgeEntry } from "@/lib/knowledge/services-kb";
import { markSoftSignal } from "@/lib/knowledge/journey-kb";
import {
  LLC_STATES, LLC_PACKAGES, LLC_PACKAGE_MARGIN, llcB2bPrice, llcProfit,
  type LlcState,
} from "@/lib/llc-pricing";
import type { Service } from "@/lib/data/types";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "B2B Services & Rates — DigiFormation Partner Hub" }] }),
  component: ServicesPage,
});

const PICKED_KEY = "df_picked_service_id";

function ServicesPage() {
  const { data: services } = useServices();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(PICKED_KEY);
  });

  const chooseService = (s: Service) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PICKED_KEY, s.id);
    }
    setPickedId(s.id);
    markSoftSignal("servicePicked");
  };

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(services.map((s) => s.category)))],
    [services],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s) =>
        (category === "All" || s.category === category) &&
        (!q || (s.name + " " + s.description + " " + s.category).toLowerCase().includes(q)),
    );
  }, [services, query, category]);

  return (
    <AppLayout
      title="B2B Services & Rates"
      subtitle="See the service, your B2B price and your profit at a glance. No extra clicks needed."
    >
      <Panel className="!p-4 sm:!p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="pl-9 bg-foreground/[0.03] border-border/60"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "whitespace-nowrap text-xs px-2.5 py-1.5 rounded-full border transition",
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="mt-3 mb-1 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filtered.length}</span> of {services.length} services.
        </div>
        <Link to="/b2b-rates" className="text-xs font-medium text-primary hover:underline shrink-0">
          Full rate list →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-3">
        {filtered.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            picked={pickedId === s.id}
            expanded={expandedId === s.id}
            onToggle={() => setExpandedId((cur) => (cur === s.id ? null : s.id))}
            onChoose={() => chooseService(s)}
          />
        ))}
      </div>

      <UsLlcPricingPanel />

      {filtered.length === 0 && (
        <Panel className="mt-5 text-center text-sm text-muted-foreground">
          No services match your filters.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => { setQuery(""); setCategory("All"); }}>
              Clear filters
            </Button>
          </div>
        </Panel>
      )}
    </AppLayout>
  );
}

// =============================================================================
// Premium service card — pricing is the visual focus, details expand inline.
// =============================================================================
function ServiceCard({
  service, picked, expanded, onToggle, onChoose,
}: {
  service: Service;
  picked: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChoose: () => void;
}) {
  const currency = (service.currency ?? "GBP") as "GBP" | "USD";
  const retail = service.retail_price;
  const b2b = service.b2b_price;
  const profit = retail != null && b2b != null ? retail - b2b : null;
  const kb: ServiceKnowledgeEntry | undefined = findServiceKnowledgeByName(service.name);

  return (
    <div className="group relative rounded-2xl glass border border-border/60 overflow-hidden flex flex-col transition hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
      {/* Gradient accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-ai to-emerald-500" />

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-sm leading-tight">
              {service.name}
            </h3>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {service.region ? `${service.region} · ` : ""}{service.category}
            </div>
          </div>
          {service.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/60 bg-foreground/[0.04] text-muted-foreground shrink-0">
              {service.badge}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{service.description}</p>

        {/* Premium 3-block pricing */}
        {retail != null ? (
          <div className="grid grid-cols-3 gap-1.5">
            <PriceBlock label="Retail" value={formatPrice(retail, currency)} tone="muted" strike />
            <PriceBlock
              label="B2B"
              value={b2b != null ? formatPrice(b2b, currency) : "—"}
              tone="primary"
            />
            <PriceBlock
              label="Profit"
              value={profit != null && profit > 0 ? `${formatPrice(profit, currency)}+` : "—"}
              tone="success"
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            <PriceBlock label="Retail" value="On request" tone="muted" />
            <PriceBlock label="B2B" value="On request" tone="primary" />
            <PriceBlock
              label="Per sale"
              value={formatPrice(service.commission_amount_gbp, "GBP")}
              tone="success"
            />
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={onChoose}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg h-9 px-2 transition press min-w-0",
              picked
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/40"
                : "bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {picked ? (
              <><Check className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Chosen</span></>
            ) : (
              <><Sparkles className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Choose</span></>
            )}
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border border-border/60 bg-foreground/[0.03] h-9 px-2 hover:border-primary/40 transition press min-w-0"
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{expanded ? "Hide details" : "View details"}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform shrink-0", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      <Collapsible open={expanded}>
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <div className="border-t border-border/60 bg-foreground/[0.02] p-4 space-y-4 text-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {kb?.fullDescription ?? service.description}
            </p>

            {kb ? (
              <>
                <KbSection icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />} title="What's included / Benefits">
                  <ul className="space-y-1.5">
                    {kb.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </KbSection>

                <KbSection icon={<Info className="h-3.5 w-3.5 text-primary" />} title="Requirements">
                  <ul className="space-y-1">
                    {kb.requirements.map((r) => (
                      <li key={r} className="flex gap-2 text-xs">
                        <span className="text-primary mt-0.5">•</span><span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </KbSection>

                <KbSection icon={<Clock className="h-3.5 w-3.5 text-ai" />} title="Processing time">
                  <p className="text-xs text-muted-foreground">{kb.processingTime}</p>
                </KbSection>

                <KbSection icon={<HelpCircle className="h-3.5 w-3.5 text-primary" />} title="FAQs">
                  <ul className="space-y-1">
                    {kb.commonQuestions.slice(0, 5).map((q) => (
                      <li key={q} className="text-xs text-muted-foreground">— {q}</li>
                    ))}
                  </ul>
                </KbSection>

                <KbSection icon={<Sparkles className="h-3.5 w-3.5 text-ai" />} title="Marketing angles">
                  <ul className="space-y-1">
                    {kb.marketingAngles.slice(0, 4).map((m) => (
                      <li key={m} className="text-xs text-muted-foreground">— {m}</li>
                    ))}
                  </ul>
                </KbSection>

                <KbSection icon={<MessageCircle className="h-3.5 w-3.5 text-amber-500" />} title="Sales tips (objections)">
                  <ul className="space-y-2">
                    {kb.objectionHandling.slice(0, 3).map((o) => (
                      <li key={o.objection} className="text-xs">
                        <div className="font-medium">{o.objection}</div>
                        <div className="text-muted-foreground mt-0.5">{o.answer}</div>
                      </li>
                    ))}
                  </ul>
                </KbSection>

                {kb.hashtags?.length > 0 && (
                  <KbSection icon={<Hash className="h-3.5 w-3.5 text-muted-foreground" />} title="Hashtags">
                    <div className="flex flex-wrap gap-1.5">
                      {kb.hashtags.map((h) => (
                        <span key={h} className="text-[11px] px-2 py-0.5 rounded-full border border-border/60 bg-foreground/[0.04]">
                          {h}
                        </span>
                      ))}
                    </div>
                  </KbSection>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Extended knowledge for this service is coming soon.
              </p>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Link to="/rebrand-studio" search={{ serviceId: service.id }}>
                  <Wand2 className="h-3.5 w-3.5 mr-1" /> Create
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Link to="/rebrand-studio" search={{ serviceId: service.id }}>
                  <Megaphone className="h-3.5 w-3.5 mr-1" /> Rebrand
                </Link>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function PriceBlock({
  label, value, tone, strike,
}: {
  label: string;
  value: string;
  tone: "muted" | "primary" | "success";
  strike?: boolean;
}) {
  const toneClasses = {
    muted: { label: "text-muted-foreground", value: "text-muted-foreground" },
    primary: { label: "text-primary", value: "text-primary" },
    success: { label: "text-success", value: "text-success" },
  }[tone];
  return (
    <div className={cn(
      "rounded-xl border px-2 py-2 text-center",
      tone === "primary"
        ? "border-primary/30 bg-primary/[0.06]"
        : tone === "success"
        ? "border-emerald-500/30 bg-emerald-500/[0.06]"
        : "border-border/60 bg-foreground/[0.03]",
    )}>
      <div className={cn("text-[9px] uppercase tracking-wider font-medium", toneClasses.label)}>{label}</div>
      <div className={cn(
        "font-bold leading-tight mt-0.5",
        tone === "primary" ? "text-base" : "text-sm",
        toneClasses.value,
        strike && "line-through font-medium",
      )}>
        {tone === "success" && value !== "—" && <TrendingUp className="inline h-3 w-3 mr-0.5 -mt-0.5" />}
        {value}
      </div>
    </div>
  );
}

function KbSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/80 mb-2">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

// =============================================================================
// US LLC Pricing — State selector + Starter / Silver / Gold packages.
// Retail prices and margins live in src/lib/llc-pricing.ts so admins can edit
// them in one place without touching component code.
// =============================================================================
function UsLlcPricingPanel() {
  const [stateCode, setStateCode] = useState<string>(LLC_STATES[0].code);
  const state: LlcState =
    LLC_STATES.find((s) => s.code === stateCode) ?? LLC_STATES[0];

  return (
    <Panel className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" /> US LLC Pricing
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a state to see retail and your B2B rate for each package. Margins are fixed: Starter ${LLC_PACKAGE_MARGIN.starter}, Silver ${LLC_PACKAGE_MARGIN.silver}, Gold ${LLC_PACKAGE_MARGIN.gold}.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Select state</div>
        <div className="flex gap-1.5 flex-wrap">
          {LLC_STATES.map((s) => {
            const active = s.code === stateCode;
            return (
              <button
                key={s.code}
                onClick={() => setStateCode(s.code)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
        {state.highlight && (
          <div className="text-[11px] text-muted-foreground mt-2 italic">
            {state.name} — {state.highlight}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {LLC_PACKAGES.map((pkg) => {
          const retail = state.retail[pkg.id];
          const b2b = llcB2bPrice(retail, pkg.id);
          const profit = llcProfit(retail, pkg.id);
          return (
            <div
              key={pkg.id}
              className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display font-semibold text-sm">{pkg.label}</div>
                  <div className="text-[11px] text-muted-foreground">{pkg.tagline}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/60 bg-foreground/[0.04] text-muted-foreground">
                  {state.code}
                </span>
              </div>

              <div className="rounded-xl bg-foreground/[0.03] border border-border/40 px-3 py-2 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Retail</div>
                  <div className="text-sm font-medium text-muted-foreground line-through">${retail}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-primary">B2B</div>
                  <div className="text-base font-bold text-primary">${b2b}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-success">Profit</div>
                  <div className="text-sm font-semibold text-success">${profit}</div>
                </div>
              </div>

              <ul className="space-y-1 text-xs text-muted-foreground">
                {pkg.includes.map((inc) => (
                  <li key={inc} className="flex gap-1.5">
                    <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
