import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PoundSterling, Clock, Banknote, Inbox, TrendingUp, Receipt } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { StatCard, Panel, PlaceholderHero } from "@/components/ui-bits";
import { useCommissions, useOrders } from "@/lib/data";

export const Route = createFileRoute("/earnings")({
  head: () => ({ meta: [{ title: "Earnings — DigiFormation" }] }),
  component: Earnings,
});

const gbp = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Earnings() {
  const { data: commissions, totals } = useCommissions();
  const { data: orders } = useOrders();

  const payouts = useMemo(
    () =>
      commissions
        .filter((c) => c.status === "paid" && c.paid_at)
        .sort((a, b) => (b.paid_at! > a.paid_at! ? 1 : -1)),
    [commissions],
  );

  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const inProgressOrders = orders.filter(
    (o) => o.status === "in_progress" || o.status === "waiting_documents",
  ).length;

  return (
    <AppLayout
      title="Earnings"
      subtitle="Track your DigiFormation reseller revenue, payouts and order activity — all in GBP."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Earnings" value={gbp(totals.lifetime)} icon={<PoundSterling className="h-5 w-5" />} variant="success" />
        <StatCard label="Pending" value={gbp(totals.pending)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard label="Paid Out" value={gbp(totals.paid)} icon={<TrendingUp className="h-5 w-5" />} variant="primary" />
        <StatCard label="Completed Orders" value={String(completedOrders)} icon={<Receipt className="h-5 w-5" />} variant="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <Panel title="Orders in progress" description="Active reseller orders being delivered by DigiFormation.">
          <div className="flex items-end gap-2">
            <span className="font-display text-3xl font-semibold">{inProgressOrders}</span>
            <span className="text-xs text-muted-foreground pb-1">awaiting completion</span>
          </div>
        </Panel>

        <Panel title="How payouts work" description="DigiFormation settles reseller earnings by manual bank transfer." className="lg:col-span-2">
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><Banknote className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" /> Payouts processed manually on the 1st of each month.</li>
            <li className="flex items-start gap-2"><Banknote className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" /> No payment gateway — DigiFormation Ltd settles directly to your nominated bank account in GBP.</li>
            <li className="flex items-start gap-2"><Banknote className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" /> For payout queries contact <strong className="text-foreground">info@digiformation.uk</strong> or WhatsApp <strong className="text-foreground">+92 316 446 7464</strong>.</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Payout history" description="Manual bank transfers from DigiFormation Ltd" className="mt-6">
        {payouts.length === 0 ? (
          <PlaceholderHero
            title="No payouts yet"
            description="Once your reseller earnings are paid out, the records will appear here."
            icon={<Inbox className="h-6 w-6" />}
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium hidden sm:table-cell">Method</th>
                  <th className="px-2 py-2 font-medium hidden md:table-cell">Reference</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-2 py-3">{new Date(p.paid_at!).toLocaleDateString("en-GB")}</td>
                    <td className="px-2 py-3 font-semibold">{gbp(p.amount_gbp)}</td>
                    <td className="px-2 py-3 text-muted-foreground hidden sm:table-cell">{(p.payout_method || "manual_bank_transfer").replace(/_/g, " ")}</td>
                    <td className="px-2 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{p.id}</td>
                    <td className="px-2 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success font-medium">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppLayout>
  );
}
