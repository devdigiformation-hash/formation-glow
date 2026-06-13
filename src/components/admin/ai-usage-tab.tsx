import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Panel } from "@/components/ui-bits";
import { Loader2, Sparkles, Coins, ShieldCheck, AlertTriangle } from "lucide-react";

type UsageRow = {
  id: string;
  partner_id: string;
  provider: string;
  model: string;
  success: boolean;
  created_at: string;
};

type Profile = { id: string; email: string | null; brand_name: string | null };

type Thresholds = { warn: number; crit: number; monthlyBudget: number };

export function AiUsageTab() {
  const [rows, setRows] = useState<UsageRow[] | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [error, setError] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>({ warn: 500, crit: 1000, monthlyBudget: 10000 });

  useEffect(() => {
    (async () => {
      const [usageRes, settingsRes] = await Promise.all([
        supabase
          .from("ai_usage")
          .select("id, partner_id, provider, model, success, created_at")
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("admin_settings")
          .select("ai_alert_warn_daily, ai_alert_crit_daily, ai_credit_budget_monthly")
          .maybeSingle(),
      ]);
      if (usageRes.error) {
        setError(usageRes.error.message);
        setRows([]);
        return;
      }
      if (settingsRes.data) {
        setThresholds({
          warn: Number(settingsRes.data.ai_alert_warn_daily ?? 500),
          crit: Number(settingsRes.data.ai_alert_crit_daily ?? 1000),
          monthlyBudget: Number(settingsRes.data.ai_credit_budget_monthly ?? 10000),
        });
      }
      const data = usageRes.data;
      setRows((data as UsageRow[]) ?? []);
      const ids = Array.from(new Set((data ?? []).map((r) => (r as UsageRow).partner_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, email, brand_name")
          .in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (map[(p as Profile).id] = p as Profile));
        setProfiles(map);
      }
    })();
  }, []);

  if (rows === null) {
    return (
      <Panel title="AI Usage Overview">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading usage…
        </div>
      </Panel>
    );
  }

  const now = Date.now();
  const dayMs = 86_400_000;
  const today = rows.filter((r) => now - new Date(r.created_at).getTime() < dayMs).length;
  const month = rows.filter((r) => now - new Date(r.created_at).getTime() < 30 * dayMs).length;
  const pollinations = rows.filter((r) => r.provider === "pollinations").length;
  const lovable = rows.filter((r) => r.provider === "lovable_gateway").length;
  const failures = rows.filter((r) => !r.success).length;

  const byPartner = new Map<string, number>();
  rows.forEach((r) => byPartner.set(r.partner_id, (byPartner.get(r.partner_id) ?? 0) + 1));
  const top = [...byPartner.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {(() => {
        const billed = rows.filter((r) => r.provider === "lovable_gateway").length;
        const monthBilled = rows.filter(
          (r) =>
            r.provider === "lovable_gateway" &&
            now - new Date(r.created_at).getTime() < 30 * dayMs,
        ).length;
        const pct = thresholds.monthlyBudget > 0 ? Math.round((monthBilled / thresholds.monthlyBudget) * 100) : 0;
        const overCrit = today >= thresholds.crit;
        const overWarn = today >= thresholds.warn;
        const overBudget = pct >= 80;
        if (!overWarn && !overBudget) return null;
        const tone = overCrit || pct >= 100 ? "destructive" : "amber";
        return (
          <div className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
            tone === "destructive" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}>
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              {overCrit && <div><strong>Critical:</strong> {today} AI calls today (≥ {thresholds.crit}).</div>}
              {!overCrit && overWarn && <div><strong>Warning:</strong> {today} AI calls today (≥ {thresholds.warn}).</div>}
              {overBudget && <div><strong>Credit budget:</strong> {monthBilled.toLocaleString()} billed calls this month ({pct}% of {thresholds.monthlyBudget.toLocaleString()} budget). Total billed all-time: {billed.toLocaleString()}.</div>}
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total" value={rows.length} icon={<Sparkles className="h-4 w-4" />} />
        <Stat label="Today" value={today} />
        <Stat label="Last 30 days" value={month} />
        <Stat label="Pollinations (free)" value={pollinations} tone="success" />
        <Stat label="Lovable (billed)" value={lovable} tone="warn" icon={<Coins className="h-4 w-4" />} />
      </div>

      <Panel title="Top Partners by AI Usage">
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No AI usage recorded yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[420px]">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left py-2">Partner</th><th className="text-right">Generations</th></tr>
            </thead>
            <tbody>
              {top.map(([uid, count]) => (
                <tr key={uid} className="border-t border-border/40">
                  <td className="py-2">
                    {profiles[uid]?.brand_name || profiles[uid]?.email || uid.slice(0, 8)}
                  </td>
                  <td className="text-right tabular-nums">{count}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Panel>

      <Panel title="Recent Activity (last 50)">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" /> {failures} failures across {rows.length} requests
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-xs min-w-[560px]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left py-1.5">When</th>
                <th className="text-left">Partner</th>
                <th className="text-left">Provider</th>
                <th className="text-left">Model</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="py-1.5">{new Date(r.created_at).toLocaleString()}</td>
                  <td>{profiles[r.partner_id]?.brand_name || profiles[r.partner_id]?.email || r.partner_id.slice(0, 8)}</td>
                  <td>{r.provider}</td>
                  <td>{r.model || "—"}</td>
                  <td className={r.success ? "text-success" : "text-destructive"}>
                    {r.success ? "ok" : "fail"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?: "success" | "warn";
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon} {label}
      </div>
      <div
        className={
          "mt-1 text-2xl font-semibold tabular-nums " +
          (tone === "success" ? "text-success" : tone === "warn" ? "text-amber-600" : "")
        }
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}
