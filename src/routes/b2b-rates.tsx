import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PoundSterling, Search, Download, MessageCircle, Wand2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SERVICES, formatPrice, type ServiceDef } from "@/lib/commission";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/b2b-rates")({
  head: () => ({
    meta: [
      { title: "B2B Rate List — DigiFormation Partner Hub" },
      { name: "description", content: "Partner & reseller B2B rates for every DigiFormation service: UK LTD, USA LLC, banking, payments, compliance, and websites." },
    ],
  }),
  component: B2BRatesPage,
});

type GroupKey = string;

function groupBy(items: ServiceDef[]): Record<GroupKey, ServiceDef[]> {
  return items.reduce<Record<GroupKey, ServiceDef[]>>((acc, s) => {
    const key = `${s.region} · ${s.category}`;
    (acc[key] ||= []).push(s);
    return acc;
  }, {});
}

function badgeColor(badge?: string) {
  switch (badge) {
    case "STARTER": return "bg-blue-900/30 text-blue-300 border-blue-500/40";
    case "SILVER": return "bg-teal-900/30 text-teal-300 border-teal-500/40";
    case "GOLD": return "bg-amber-900/30 text-amber-300 border-amber-500/40";
    case "PLATINUM": return "bg-violet-900/30 text-violet-300 border-violet-500/40";
    case "VAT": return "bg-red-900/30 text-red-300 border-red-500/40";
    case "BASIC": return "bg-slate-800/40 text-slate-300 border-slate-500/40";
    case "STANDARD": return "bg-sky-900/30 text-sky-300 border-sky-500/40";
    case "PREMIUM": return "bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-500/40";
    default: return "bg-foreground/10 text-muted-foreground border-border/60";
  }
}

function B2BRatesPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<"All" | "UK" | "USA" | "Global">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter((s) =>
      (region === "All" || s.region === region) &&
      (!q || (s.name + " " + s.description + " " + s.category).toLowerCase().includes(q)),
    );
  }, [query, region]);

  const grouped = useMemo(() => groupBy(filtered), [filtered]);

  const totals = useMemo(() => {
    const gbp = SERVICES.filter((s) => s.currency === "GBP" && s.b2b != null)
      .reduce((sum, s) => sum + (s.retail - (s.b2b ?? 0)), 0);
    const usd = SERVICES.filter((s) => s.currency === "USD" && s.b2b != null)
      .reduce((sum, s) => sum + (s.retail - (s.b2b ?? 0)), 0);
    return { gbp, usd };
  }, []);

  return (
    <AppLayout
      title="B2B Rate List"
      subtitle="Your partner / reseller pricing across every DigiFormation service. Difference between retail and B2B is your commission per confirmed sale."
    >
      <Panel className="!p-4 sm:!p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, e.g. Stripe, LLC, Confirmation…"
              className="pl-9 bg-foreground/[0.03] border-border/60"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {(["All", "UK", "USA", "Global"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={cn(
                  "whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition",
                  region === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2 text-[11px] uppercase tracking-wider">
            <span className="px-2.5 py-1.5 rounded-full bg-success/15 text-success border border-success/30">
              Total UK saving £{totals.gbp}
            </span>
            <span className="px-2.5 py-1.5 rounded-full bg-success/15 text-success border border-success/30">
              Total US saving ${totals.usd}
            </span>
          </div>
        </div>
      </Panel>

      <div className="mt-5 space-y-6">
        {Object.entries(grouped).map(([group, items]) => (
          <section key={group}>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {group}
            </h2>
            <Panel className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-foreground/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium">Service</th>
                      <th className="text-right px-4 py-2.5 font-medium">Retail</th>
                      <th className="text-right px-4 py-2.5 font-medium">B2B Rate</th>
                      <th className="text-right px-4 py-2.5 font-medium">Your Saving</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => {
                      const saving = s.b2b != null ? s.retail - s.b2b : null;
                      return (
                        <tr key={s.name} className="border-t border-border/40 hover:bg-foreground/[0.02]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{s.name}</span>
                              {s.badge && (
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", badgeColor(s.badge))}>
                                  {s.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{s.description}</div>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground line-through">
                            {formatPrice(s.retail, s.currency)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-semibold">
                            {s.b2b != null ? formatPrice(s.b2b, s.currency) : <span className="text-muted-foreground">On request</span>}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {saving != null ? (
                              <span className="inline-flex items-center gap-1 text-success font-semibold">
                                <PoundSterling className="h-3 w-3" />
                                {formatPrice(saving, s.currency).replace(/^[£$]/, s.currency === "USD" ? "$" : "£")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">TBD</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              to="/rebrand-studio"
                              className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg bg-primary/15 text-primary border border-primary/30 h-8 px-2.5 hover:bg-primary/25 transition"
                            >
                              <Wand2 className="h-3.5 w-3.5" /> Promote
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </section>
        ))}

        {filtered.length === 0 && (
          <Panel className="text-center text-sm text-muted-foreground">
            No services match your filters.
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => { setQuery(""); setRegion("All"); }}>
                Clear filters
              </Button>
            </div>
          </Panel>
        )}
      </div>

      <Panel className="mt-6 !p-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong className="text-foreground">Retail</strong> = client-facing price ·{" "}
            <strong className="text-foreground">B2B Rate</strong> = partner / reseller price ·{" "}
            <strong className="text-foreground">Saving</strong> = your commission per confirmed sale. Prices subject to change without prior notice.
          </div>
          <div className="flex gap-2">
            <a
              href="https://wa.me/digiformationltd"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 h-8 px-3 hover:border-primary/40"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Sales
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 h-8 px-3 hover:border-primary/40"
            >
              <Download className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>
      </Panel>
    </AppLayout>
  );
}
