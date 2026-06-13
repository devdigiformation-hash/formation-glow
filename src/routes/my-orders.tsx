import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  PackageCheck,
  Inbox,
  Mail,
  Phone,
  Receipt,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel, StatCard, PlaceholderHero } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { useOrders, useCommissions } from "@/lib/data";
import type { OrderStatus, CommissionStatus } from "@/lib/data";
import { formatGbp } from "@/lib/commission";

export const Route = createFileRoute("/my-orders")({
  head: () => ({ meta: [{ title: "My Orders — DigiFormation Affiliate Hub" }] }),
  component: MyOrders,
});

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New Order",
  contacted: "Contacted",
  in_progress: "In Progress",
  waiting_documents: "Waiting Documents",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<OrderStatus, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-foreground/10 text-foreground/80",
  in_progress: "bg-warning/15 text-warning",
  waiting_documents: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

const COMMISSION_TONE: Record<CommissionStatus, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-primary/15 text-primary",
  delayed: "bg-warning/15 text-warning",
  paid: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

function MyOrders() {
  const { data: orders } = useOrders();
  const { data: commissions } = useCommissions();

  const totals = useMemo(() => {
    const by: Record<OrderStatus, number> = { new: 0, contacted: 0, in_progress: 0, waiting_documents: 0, completed: 0, cancelled: 0 };
    orders.forEach((o) => { by[o.status] += 1; });
    return by;
  }, [orders]);

  const commissionByLead = useMemo(() => {
    const m = new Map<string, (typeof commissions)[number]>();
    commissions.forEach((c) => { if (c.lead_id) m.set(c.lead_id, c); });
    return m;
  }, [commissions]);

  return (
    <AppLayout title="My Orders" subtitle="Track every confirmed order linked to your account.">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Orders" value={String(orders.length)} icon={<ShoppingBag className="h-5 w-5" />} variant="primary" />
        <StatCard label="In Progress" value={String(totals.in_progress + totals.waiting_documents)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard label="Completed" value={String(totals.completed)} icon={<PackageCheck className="h-5 w-5" />} variant="success" />
        <StatCard label="New" value={String(totals.new + totals.contacted)} icon={<Receipt className="h-5 w-5" />} variant="ai" />
      </div>

      {orders.length === 0 ? (
        <Panel className="mt-5">
          <PlaceholderHero
            title="No orders yet"
            description="When the DigiFormation team confirms an order linked to your account, it will appear here so you can follow the progress."
            icon={<Inbox className="h-6 w-6" />}
          />
        </Panel>
      ) : (
        <Panel title="Orders" description="Read-only view of your client orders" className="mt-5">
          <ul className="divide-y divide-border/60">
            {orders.map((o) => {
              const commission = o.lead_id ? commissionByLead.get(o.lead_id) : undefined;
              return (
                <li key={o.id} className="py-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {o.client_name} <span className="text-muted-foreground font-normal">— {o.service_name_snapshot}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        {o.client_whatsapp && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {o.client_whatsapp}</span>}
                        {o.client_email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {o.client_email}</span>}
                        <span>{new Date(o.created_at).toLocaleDateString("en-GB")}</span>
                        {o.completed_at && <span>Completed {new Date(o.completed_at).toLocaleDateString("en-GB")}</span>}
                      </div>
                      {o.partner_visible_notes && (
                        <div className="mt-2 text-xs bg-foreground/[0.03] rounded px-2 py-1.5 border border-border/60">
                          <span className="text-muted-foreground">Note from team: </span>{o.partner_visible_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded", STATUS_TONE[o.status])}>
                        {STATUS_LABEL[o.status]}
                      </span>
                      {commission && (
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded", COMMISSION_TONE[commission.status])}>
                          Commission: {commission.status} · {formatGbp(commission.amount_gbp)}
                        </span>
                      )}
                    </div>
                  </div>
                  {commission?.status === "delayed" && (
                    <div className="mt-2 text-xs text-warning">
                      Your payout is delayed. DigiFormation team will update you manually.
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </AppLayout>
  );
}
