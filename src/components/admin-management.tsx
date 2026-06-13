// Admin management tabs — Commissions, Partners, Orders, Audit Log.
// UI-only; data hooks live in @/lib/data and gate-checking lives in __root.

import { useMemo, useState } from "react";
import {
  Search,
  Check,
  X as XIcon,
  Banknote,
  Users,
  ScrollText,
  PoundSterling,
  Building2,
  Mail,
  Phone,
  Globe,
  Clock,
  PackageCheck,
  ShoppingBag,
  Save,
} from "lucide-react";
import { Panel, StatCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useAllCommissions,
  useAllPartners,
  useAllOrders,
  useAuditLog,
  useServices,
} from "@/lib/data";
import { logAudit } from "@/lib/data/hooks";
import { useAuth } from "@/lib/auth/context";
import { formatGbp } from "@/lib/commission";
import type {
  AuditAction,
  Commission,
  CommissionStatus,
  Order,
  OrderStatus,
} from "@/lib/data";


// ─── Admin Commissions ──────────────────────────────────────────────────────

const COMMISSION_STATUSES: ("all" | CommissionStatus)[] = ["all", "pending", "approved", "delayed", "paid", "rejected"];

export function AdminCommissionsTab() {
  const { data: commissions, approve, reject, markPaid, markDelayed } = useAllCommissions();
  const { data: partners } = useAllPartners();
  const { user, profile } = useAuth();
  const actor = useMemo(
    () => ({ id: user?.id ?? null, label: profile?.brand_name || profile?.email || user?.email || "admin" }),
    [user, profile, user?.email],
  );
  const [statusFilter, setStatusFilter] = useState<"all" | CommissionStatus>("all");

  const partnerLookup = useMemo(() => {
    const m = new Map<string, (typeof partners)[number]>();
    partners.forEach((p) => m.set(p.id, p));
    return m;
  }, [partners]);

  const filtered = useMemo(
    () => (statusFilter === "all" ? commissions : commissions.filter((c) => c.status === statusFilter)),
    [commissions, statusFilter],
  );

  const totals = useMemo(() => {
    const sum = (s: CommissionStatus) =>
      commissions.filter((c) => c.status === s).reduce((acc, c) => acc + c.amount_gbp, 0);
    return { pending: sum("pending"), approved: sum("approved"), delayed: sum("delayed"), paid: sum("paid") };
  }, [commissions]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Pending" value={formatGbp(totals.pending)} icon={<PoundSterling className="h-5 w-5" />} variant="warning" />
        <StatCard label="Approved" value={formatGbp(totals.approved)} icon={<Check className="h-5 w-5" />} variant="primary" />
        <StatCard label="Delayed" value={formatGbp(totals.delayed)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard label="Paid" value={formatGbp(totals.paid)} icon={<Banknote className="h-5 w-5" />} variant="success" />
      </div>

      <Panel className="mt-5">
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
          {COMMISSION_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition",
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No commissions in this view yet.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {filtered.map((c) => {
              const partner = partnerLookup.get(c.partner_id);
              return (
                <li key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {formatGbp(c.amount_gbp)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {partner?.brand_name || partner?.full_name || "Unknown partner"}
                      </span>
                      <span>{new Date(c.created_at).toLocaleDateString("en-GB")}</span>
                      {c.paid_at && <span>Paid {new Date(c.paid_at).toLocaleDateString("en-GB")}</span>}
                    </div>
                  </div>
                  <CommissionActions
                    commission={c}
                    onApprove={() => approve(c.id, actor)}
                    onReject={() => reject(c.id, actor)}
                    onMarkPaid={() => markPaid(c.id, "manual_bank_transfer", actor)}
                    onMarkDelayed={() => markDelayed(c.id, actor)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

function CommissionActions({
  commission,
  onApprove,
  onReject,
  onMarkPaid,
  onMarkDelayed,
}: {
  commission: Commission;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
  onMarkDelayed: () => void;
}) {
  const statusBadge: Record<CommissionStatus, string> = {
    pending: "bg-warning/15 text-warning",
    approved: "bg-primary/15 text-primary",
    delayed: "bg-warning/15 text-warning",
    paid: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded", statusBadge[commission.status])}>
        {commission.status}
      </span>
      {commission.status === "pending" && (
        <>
          <Button size="sm" variant="outline" className="h-8" onClick={onApprove}>
            <Check className="h-3.5 w-3.5 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive" onClick={onReject}>
            <XIcon className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
        </>
      )}
      {(commission.status === "approved" || commission.status === "delayed") && (
        <Button size="sm" className="h-8" onClick={onMarkPaid}>
          <Banknote className="h-3.5 w-3.5 mr-1" /> Mark Paid
        </Button>
      )}
      {commission.status === "approved" && (
        <Button size="sm" variant="outline" className="h-8" onClick={onMarkDelayed}>
          <Clock className="h-3.5 w-3.5 mr-1" /> Mark Delayed
        </Button>
      )}
    </div>
  );
}

// ─── Admin Partners ─────────────────────────────────────────────────────────

export function AdminPartnersTab() {
  const { data: partners } = useAllPartners();
  const { data: commissions } = useAllCommissions();
  const { data: orders } = useAllOrders();

  const stats = useMemo(() => {
    const byPartner = new Map<string, { orders: number; completed: number; earned: number; paid: number }>();
    partners.forEach((p) => byPartner.set(p.id, { orders: 0, completed: 0, earned: 0, paid: 0 }));
    orders.forEach((o) => {
      const s = byPartner.get(o.partner_id);
      if (!s) return;
      s.orders += 1;
      if (o.status === "completed") s.completed += 1;
    });
    commissions.forEach((c) => {
      const s = byPartner.get(c.partner_id);
      if (!s) return;
      if (c.status === "approved" || c.status === "paid") s.earned += c.amount_gbp;
      if (c.status === "paid") s.paid += c.amount_gbp;
    });
    return byPartner;
  }, [partners, orders, commissions]);

  return (
    <Panel
      title="Partners"
      description={`${partners.length} registered ${partners.length === 1 ? "partner" : "partners"}`}
    >
      {partners.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No partners registered yet.
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {partners.map((p) => {
            const s = stats.get(p.id) ?? { orders: 0, completed: 0, earned: 0, paid: 0 };
            return (
              <li key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {p.brand_name || p.full_name || p.email}
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded",
                      p.status === "active" ? "bg-success/15 text-success" :
                        p.status === "pending" ? "bg-warning/15 text-warning" :
                          "bg-destructive/15 text-destructive",
                    )}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                    {p.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email}</span>}
                    {p.whatsapp && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {p.whatsapp}</span>}
                    {p.website && <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> {p.website}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs shrink-0">
                  <Stat label="Orders" value={String(s.orders)} />
                  <Stat label="Completed" value={String(s.completed)} />
                  <Stat label="Earned" value={formatGbp(s.earned)} />
                  <Stat label="Paid" value={formatGbp(s.paid)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<AuditAction, string> = {
  "lead.created": "Order created",
  "lead.converted": "Order completed",
  "lead.status_changed": "Order updated",
  "order.created": "Order created",
  "order.status_changed": "Order status changed",
  "order.completed": "Order completed",
  "commission.approved": "Revenue approved",
  "commission.delayed": "Revenue delayed",
  "commission.rejected": "Revenue rejected",
  "commission.paid": "Revenue paid",
};

const ACTION_TONE: Record<AuditAction, string> = {
  "lead.created": "bg-primary/15 text-primary",
  "lead.converted": "bg-success/15 text-success",
  "lead.status_changed": "bg-foreground/10 text-foreground/80",
  "order.created": "bg-primary/15 text-primary",
  "order.status_changed": "bg-foreground/10 text-foreground/80",
  "order.completed": "bg-success/15 text-success",
  "commission.approved": "bg-primary/15 text-primary",
  "commission.delayed": "bg-warning/15 text-warning",
  "commission.rejected": "bg-destructive/15 text-destructive",
  "commission.paid": "bg-success/15 text-success",
};

export function AdminAuditTab() {
  const { data } = useAuditLog();
  return (
    <Panel
      title="Audit Log"
      description="Append-only history of every order and revenue event"
    >
      {data.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center gap-2">
          <ScrollText className="h-6 w-6" />
          No audit events yet. Activity will appear here as partners place orders and admins record revenue.
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {data.map((e) => (
            <li key={e.id} className="py-3 flex items-start gap-3">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded shrink-0 mt-0.5", ACTION_TONE[e.action])}>
                {ACTION_LABELS[e.action] ?? e.action}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{e.actor_label}</span>{" "}
                  <span className="text-muted-foreground">on {e.subject_type}</span>
                </div>
                {Object.keys(e.metadata).length > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {Object.entries(e.metadata)
                      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                      .join(" • ")}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                {new Date(e.created_at).toLocaleString("en-GB")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// Re-export icons used by parent tab list, so admin.tsx can keep its imports clean.
export const AdminTabIcons = { Users, PoundSterling, ScrollText };

// ─── Admin Orders ───────────────────────────────────────────────────────────

const ORDER_STATUSES: ("all" | OrderStatus)[] = ["all", "new", "contacted", "in_progress", "waiting_documents", "completed", "cancelled"];

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New Order",
  contacted: "Contacted",
  in_progress: "In Progress",
  waiting_documents: "Waiting Documents",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-foreground/10 text-foreground/80",
  in_progress: "bg-warning/15 text-warning",
  waiting_documents: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

export function AdminOrdersTab() {
  const { data: orders, setStatus, updateNotes } = useAllOrders();
  const { data: partners } = useAllPartners();
  const { data: services } = useServices({ includeInactive: true });
  const { user, profile } = useAuth();
  const actor = useMemo(
    () => ({ id: user?.id ?? null, label: profile?.brand_name || profile?.email || user?.email || "admin" }),
    [user, profile, user?.email],
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const partnerLookup = useMemo(() => {
    const m = new Map<string, (typeof partners)[number]>();
    partners.forEach((p) => m.set(p.id, p));
    return m;
  }, [partners]);

  const serviceLookup = useMemo(() => {
    const m = new Map<string, (typeof services)[number]>();
    services.forEach((s) => m.set(s.id, s));
    return m;
  }, [services]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(String(s.category)));
    return ["all", ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (partnerFilter !== "all" && o.partner_id !== partnerFilter) return false;
      if (categoryFilter !== "all") {
        const cat = o.service_id ? String(serviceLookup.get(o.service_id)?.category ?? "") : "";
        if (cat !== categoryFilter) return false;
      }
      if (!q) return true;
      return (o.client_name + " " + o.client_whatsapp + " " + o.service_name_snapshot).toLowerCase().includes(q);
    });
  }, [orders, statusFilter, partnerFilter, categoryFilter, query, serviceLookup]);

  const totals = useMemo(() => {
    const by: Record<OrderStatus, number> = { new: 0, contacted: 0, in_progress: 0, waiting_documents: 0, completed: 0, cancelled: 0 };
    orders.forEach((o) => { by[o.status] += 1; });
    return by;
  }, [orders]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Orders" value={String(orders.length)} icon={<ShoppingBag className="h-5 w-5" />} variant="primary" />
        <StatCard label="In Progress" value={String(totals.in_progress + totals.waiting_documents)} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard label="Completed" value={String(totals.completed)} icon={<PackageCheck className="h-5 w-5" />} variant="success" />
        <StatCard label="Cancelled" value={String(totals.cancelled)} icon={<XIcon className="h-5 w-5" />} variant="warning" />
      </div>

      <Panel className="mt-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search client name, WhatsApp, service…" className="pl-9 bg-foreground/[0.03] border-border/60" />
          </div>
          <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className="text-xs h-9 rounded-md bg-foreground/[0.03] border border-border/60 px-2">
            <option value="all">All partners</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.brand_name || p.full_name || p.email}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs h-9 rounded-md bg-foreground/[0.03] border border-border/60 px-2">
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
          </select>
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition",
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : ORDER_STATUS_LABEL[s as OrderStatus]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No orders match these filters.</div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {filtered.map((o) => {
              const partner = partnerLookup.get(o.partner_id);
              const expanded = expandedId === o.id;
              return (
                <li key={o.id} className="py-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {o.client_name} <span className="text-muted-foreground font-normal">— {o.service_name_snapshot}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{partner?.brand_name || partner?.full_name || "Unknown partner"}</span>
                        {o.client_whatsapp && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {o.client_whatsapp}</span>}
                        {o.client_email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {o.client_email}</span>}
                        <span>{new Date(o.created_at).toLocaleDateString("en-GB")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded", ORDER_STATUS_TONE[o.status])}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value as OrderStatus, actor)}
                        className="text-xs h-8 rounded-md bg-foreground/[0.03] border border-border/60 px-2"
                      >
                        {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                      </select>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setExpandedId(expanded ? null : o.id)}>
                        {expanded ? "Hide notes" : "Notes"}
                      </Button>
                    </div>
                  </div>
                  {expanded && <OrderNotesEditor order={o} onSave={(patch) => updateNotes(o.id, patch)} />}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

function OrderNotesEditor({ order, onSave }: { order: Order; onSave: (patch: { admin_notes?: string; partner_visible_notes?: string }) => void }) {
  const [adminNotes, setAdminNotes] = useState(order.admin_notes);
  const [partnerNotes, setPartnerNotes] = useState(order.partner_visible_notes);
  return (
    <div className="mt-3 grid sm:grid-cols-2 gap-3 bg-foreground/[0.02] rounded-lg p-3 border border-border/60">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Admin notes (internal)</label>
        <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="mt-1 bg-background/40" />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Partner-visible notes</label>
        <Textarea value={partnerNotes} onChange={(e) => setPartnerNotes(e.target.value)} rows={3} className="mt-1 bg-background/40" />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button size="sm" onClick={() => onSave({ admin_notes: adminNotes, partner_visible_notes: partnerNotes })}>
          <Save className="h-3.5 w-3.5 mr-1.5" /> Save notes
        </Button>
      </div>
    </div>
  );
}
