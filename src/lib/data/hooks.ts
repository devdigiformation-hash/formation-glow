// =============================================================================
// Collection instances + hooks.
// -----------------------------------------------------------------------------
// One Collection per table in the Supabase schema. Hooks expose a stable
// React API (`{ data, ...mutators }`) that components consume. To migrate
// any single table to Supabase, replace the body of its hook with a Query
// call — the consumer signature stays identical.
// =============================================================================

import { useCallback, useMemo } from "react";
import { Collection, useCollection } from "./store";
import { useCurrentPartnerId } from "@/lib/auth/context";

import type {
  AIUsage,
  AdminCreative,
  AuditAction,
  AuditLog,
  Commission,
  CommissionInput,
  Download,
  DownloadInput,
  GeneratedCreative,
  GeneratedCreativeInput,
  ManualLead,
  ManualLeadInput,
  Order,
  OrderStatus,
  Partner,
  Service,
} from "./types";

// ---------- collections -----------------------------------------------------
export const partnersCollection = new Collection<Partner>({
  table: "profiles",
  idPrefix: "ptn",
});

export const servicesCollection = new Collection<Service>({
  table: "services",
  idPrefix: "svc",
});

export const manualLeadsCollection = new Collection<ManualLead>({
  table: "manual_leads",
  idPrefix: "lead",
});

export const commissionsCollection = new Collection<Commission>({
  table: "commissions",
  idPrefix: "com",
});

export const adminCreativesCollection = new Collection<AdminCreative>({
  table: "admin_creatives",
  idPrefix: "acr",
});

export const generatedCreativesCollection = new Collection<GeneratedCreative>({
  table: "generated_creatives",
  idPrefix: "gen",
});

export const aiUsageCollection = new Collection<AIUsage>({
  table: "ai_usage",
  idPrefix: "ai",
});

export const downloadsCollection = new Collection<Download>({
  table: "downloads",
  idPrefix: "dl",
});

export const auditLogCollection = new Collection<AuditLog>({
  table: "audit_log",
  idPrefix: "aud",
});

export const ordersCollection = new Collection<Order>({
  table: "orders",
  idPrefix: "ord",
});

// ============================================================================
// logAudit — append an audit entry from anywhere in the app. Imperative
// helper (not a hook) so it can be called from effects or event handlers.
// ============================================================================
export function logAudit(input: {
  action: AuditAction;
  subject_type: AuditLog["subject_type"];
  subject_id: string;
  actor_id?: string | null;
  actor_label?: string;
  metadata?: Record<string, unknown>;
}) {
  return auditLogCollection.insert({
    actor_id: input.actor_id ?? null,
    actor_label: input.actor_label ?? "system",
    action: input.action,
    subject_type: input.subject_type,
    subject_id: input.subject_id,
    metadata: input.metadata ?? {},
  } as Omit<AuditLog, "id" | "created_at">);
}

// ============================================================================
// usePartnerProfile — backed by the partners collection, keyed by the
// authenticated user's id (falls back to the legacy demo partner pre-auth).
// ============================================================================
export function usePartnerProfile() {
  const partnerId = useCurrentPartnerId();
  const rows = useCollection(partnersCollection);
  const profile = useMemo(
    () => rows.find((p) => p.id === partnerId) ?? null,
    [rows, partnerId],
  );

  const save = useCallback((patch: Partial<Partner>) => {
    if (profile) {
      return partnersCollection.update(profile.id, patch);
    }
    // No profile row yet (trigger didn't fire, or first save) — insert one
    // keyed by the authenticated user's id so RLS (auth.uid() = id) passes.
    return partnersCollection.insert({
      id: partnerId,
      full_name: "",
      brand_name: "",
      logo_url: null,
      whatsapp: "",
      email: "",
      website: null,
      primary_color: "#22d3ee",
      secondary_color: "#a78bfa",
      status: "active",
      social_links: {},
      ...patch,
    } as unknown as Omit<Partner, "created_at" | "updated_at">);
  }, [profile, partnerId]);

  return { profile, save, partnerId: profile?.id ?? partnerId };
}

// ============================================================================
// useServices — read-only for partners, admin-only mutators for Admin Center.
// ============================================================================
export function useServices(opts: { includeInactive?: boolean } = {}) {
  const rows = useCollection(servicesCollection);
  const data = useMemo(
    () => (opts.includeInactive ? rows : rows.filter((s) => s.is_active)),
    [rows, opts.includeInactive],
  );

  const upsert = useCallback((row: Service) => {
    const existing = servicesCollection.get(row.id);
    return existing
      ? servicesCollection.update(row.id, row)
      : servicesCollection.insert(row);
  }, []);

  const setActive = useCallback((id: string, is_active: boolean) => {
    return servicesCollection.update(id, { is_active });
  }, []);

  return { data, upsert, setActive };
}

// ============================================================================
// useManualLeads — partner-scoped; estimated_commission_gbp computed at insert.
// ============================================================================
export function useManualLeads(partnerIdOverride?: string) {
  const ctxPartnerId = useCurrentPartnerId();
  const partnerId = partnerIdOverride ?? ctxPartnerId;
  const rows = useCollection(manualLeadsCollection);
  const data = useMemo(
    () => rows.filter((l) => l.partner_id === partnerId),
    [rows, partnerId],
  );

  const create = useCallback((input: Omit<ManualLeadInput, "partner_id" | "estimated_commission_gbp"> & {
    estimated_commission_gbp?: number;
  }) => {
    const service = input.service_id ? servicesCollection.get(input.service_id) : null;
    const estimated =
      input.estimated_commission_gbp ?? service?.commission_amount_gbp ?? 20;
    return manualLeadsCollection.insert({
      partner_id: partnerId,
      estimated_commission_gbp: estimated,
      ...input,
    } as ManualLeadInput);
  }, [partnerId]);

  const updateLead = useCallback((id: string, patch: Partial<ManualLead>) => {
    return manualLeadsCollection.update(id, patch);
  }, []);

  const remove = useCallback((id: string) => manualLeadsCollection.remove(id), []);

  return { data, create, update: updateLead, remove };
}

// ============================================================================
// useCommissions — partner-scoped ledger with derived totals.
// ============================================================================
export function useCommissions(partnerIdOverride?: string) {
  const ctxPartnerId = useCurrentPartnerId();
  const partnerId = partnerIdOverride ?? ctxPartnerId;
  const rows = useCollection(commissionsCollection);
  const data = useMemo(
    () => rows.filter((c) => c.partner_id === partnerId),
    [rows, partnerId],
  );

  const totals = useMemo(() => {
    const sum = (status: Commission["status"]) =>
      data.filter((c) => c.status === status).reduce((s, c) => s + c.amount_gbp, 0);
    return {
      pending: sum("pending"),
      approved: sum("approved"),
      delayed: sum("delayed"),
      paid: sum("paid"),
      lifetime: data.reduce((s, c) => s + c.amount_gbp, 0),
    };
  }, [data]);

  const create = useCallback((input: Omit<CommissionInput, "partner_id">) => {
    return commissionsCollection.insert({ partner_id: partnerId, ...input } as CommissionInput);
  }, [partnerId]);

  const updateCommission = useCallback((id: string, patch: Partial<Commission>) => {
    return commissionsCollection.update(id, patch);
  }, []);

  return { data, totals, create, update: updateCommission };
}

// ============================================================================
// useAdminCreatives — full CRUD, used by Admin Creative Library.
// ============================================================================
export function useAdminCreatives(opts: { includeArchived?: boolean } = {}) {
  const rows = useCollection(adminCreativesCollection);
  const data = useMemo(
    () => (opts.includeArchived ? rows : rows.filter((c) => !c.is_archived)),
    [rows, opts.includeArchived],
  );

  const insert = useCallback((input: Omit<AdminCreative, "id" | "created_at">) => {
    return adminCreativesCollection.insert(input);
  }, []);

  const update = useCallback((id: string, patch: Partial<AdminCreative>) => {
    return adminCreativesCollection.update(id, patch);
  }, []);

  const archive = useCallback((id: string, is_archived = true) => {
    return adminCreativesCollection.update(id, { is_archived });
  }, []);

  const remove = useCallback((id: string) => adminCreativesCollection.remove(id), []);

  return { data, insert, update, archive, remove };
}

// ============================================================================
// useGeneratedCreatives — partner-scoped history of Rebrand Studio exports.
// ============================================================================
export function useGeneratedCreatives(partnerIdOverride?: string) {
  const ctxPartnerId = useCurrentPartnerId();
  const partnerId = partnerIdOverride ?? ctxPartnerId;
  const rows = useCollection(generatedCreativesCollection);
  const data = useMemo(
    () => rows.filter((g) => g.partner_id === partnerId),
    [rows, partnerId],
  );

  const create = useCallback((input: Omit<GeneratedCreativeInput, "partner_id">) => {
    return generatedCreativesCollection.insert({
      partner_id: partnerId,
      ...input,
    } as GeneratedCreativeInput);
  }, [partnerId]);

  const remove = useCallback((id: string) => generatedCreativesCollection.remove(id), []);

  return { data, create, remove };
}

// ============================================================================
// useAIUsage — append-only log of every AI Lab call.
// ============================================================================
export function useAIUsage(partnerIdOverride?: string) {
  const ctxPartnerId = useCurrentPartnerId();
  const partnerId = partnerIdOverride ?? ctxPartnerId;
  const rows = useCollection(aiUsageCollection);
  const data = useMemo(
    () => rows.filter((u) => u.partner_id === partnerId),
    [rows, partnerId],
  );

  const log = useCallback((input: {
    provider: string;
    model: string;
    success: boolean;
    error_message?: string | null;
  }) => {
    return aiUsageCollection.insert({
      partner_id: partnerId,
      provider: input.provider,
      model: input.model,
      success: input.success,
      error_message: input.error_message ?? null,
    });
  }, [partnerId]);

  const stats = useMemo(() => ({
    total: data.length,
    successes: data.filter((d) => d.success).length,
    failures: data.filter((d) => !d.success).length,
  }), [data]);

  return { data, stats, log };
}

// ============================================================================
// useDownloads — append-only log of partner exports.
// ============================================================================
export function useDownloads(partnerIdOverride?: string) {
  const ctxPartnerId = useCurrentPartnerId();
  const partnerId = partnerIdOverride ?? ctxPartnerId;
  const rows = useCollection(downloadsCollection);
  const data = useMemo(
    () => rows.filter((d) => d.partner_id === partnerId),
    [rows, partnerId],
  );

  const log = useCallback((input: Omit<DownloadInput, "partner_id">) => {
    const downloaded_at = new Date().toISOString();
    return downloadsCollection.insert({
      partner_id: partnerId,
      downloaded_at,
      ...input,
    } as DownloadInput & { downloaded_at: string });
  }, [partnerId]);

  return { data, log };
}

// ============================================================================
// ADMIN-WIDE hooks — return cross-partner data. UI must gate access via
// useAuth().isAdmin; these hooks do not enforce auth on their own.
// ============================================================================

export function useAllLeads() {
  const rows = useCollection(manualLeadsCollection);
  const data = useMemo(
    () => [...rows].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)),
    [rows],
  );
  const update = useCallback((id: string, patch: Partial<ManualLead>) => {
    return manualLeadsCollection.update(id, patch);
  }, []);
  return { data, update };
}

export function useAllCommissions() {
  const rows = useCollection(commissionsCollection);
  const data = useMemo(
    () => [...rows].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)),
    [rows],
  );

  const approve = useCallback((id: string, actor?: { id: string | null; label: string }) => {
    const updated = commissionsCollection.update(id, { status: "approved" });
    if (updated) logAudit({
      action: "commission.approved",
      subject_type: "commission",
      subject_id: id,
      actor_id: actor?.id ?? null,
      actor_label: actor?.label ?? "admin",
      metadata: { amount_gbp: updated.amount_gbp },
    });
    return updated;
  }, []);

  const reject = useCallback((id: string, actor?: { id: string | null; label: string }) => {
    const updated = commissionsCollection.update(id, { status: "rejected" });
    if (updated) logAudit({
      action: "commission.rejected",
      subject_type: "commission",
      subject_id: id,
      actor_id: actor?.id ?? null,
      actor_label: actor?.label ?? "admin",
      metadata: { amount_gbp: updated.amount_gbp },
    });
    return updated;
  }, []);

  const markPaid = useCallback((id: string, payout_method: Commission["payout_method"] = "manual_bank_transfer", actor?: { id: string | null; label: string }, admin_note?: string) => {
    const updated = commissionsCollection.update(id, {
      status: "paid",
      paid_at: new Date().toISOString(),
      payout_method,
      ...(admin_note !== undefined ? { admin_note } : {}),
    });
    if (updated) logAudit({
      action: "commission.paid",
      subject_type: "commission",
      subject_id: id,
      actor_id: actor?.id ?? null,
      actor_label: actor?.label ?? "admin",
      metadata: { amount_gbp: updated.amount_gbp, payout_method },
    });
    return updated;
  }, []);

  const markDelayed = useCallback((id: string, actor?: { id: string | null; label: string }) => {
    const updated = commissionsCollection.update(id, { status: "delayed" });
    if (updated) logAudit({
      action: "commission.delayed",
      subject_type: "commission",
      subject_id: id,
      actor_id: actor?.id ?? null,
      actor_label: actor?.label ?? "admin",
      metadata: { amount_gbp: updated.amount_gbp },
    });
    return updated;
  }, []);

  return { data, approve, reject, markPaid, markDelayed };
}

export function useAllPartners() {
  const rows = useCollection(partnersCollection);
  return { data: rows };
}

export function useAuditLog() {
  const rows = useCollection(auditLogCollection);
  const data = useMemo(
    () => [...rows].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)),
    [rows],
  );
  return { data };
}

// ============================================================================
// Orders — partner-scoped read + admin-scoped read/update. Created from
// converted leads via createOrderFromLead.
// ============================================================================
export function useOrders(partnerIdOverride?: string) {
  const ctxPartnerId = useCurrentPartnerId();
  const partnerId = partnerIdOverride ?? ctxPartnerId;
  const rows = useCollection(ordersCollection);
  const data = useMemo(
    () => rows
      .filter((o) => o.partner_id === partnerId)
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1)),
    [rows, partnerId],
  );
  return { data };
}

export function useAllOrders() {
  const rows = useCollection(ordersCollection);
  const data = useMemo(
    () => [...rows].sort((a, b) => (b.created_at > a.created_at ? 1 : -1)),
    [rows],
  );

  const setStatus = useCallback((id: string, next: OrderStatus, actor?: { id: string | null; label: string }) => {
    const prev = ordersCollection.get(id);
    const patch: Partial<Order> = { status: next };
    if (next === "completed") patch.completed_at = new Date().toISOString();
    const updated = ordersCollection.update(id, patch);
    if (!updated) return null;
    logAudit({
      action: next === "completed" ? "order.completed" : "order.status_changed",
      subject_type: "lead",
      subject_id: id,
      actor_id: actor?.id ?? null,
      actor_label: actor?.label ?? "admin",
      metadata: { from: prev?.status, to: next, client: updated.client_name, service: updated.service_name_snapshot },
    });
    return updated;
  }, []);

  const updateNotes = useCallback((id: string, patch: { admin_notes?: string; partner_visible_notes?: string }) => {
    return ordersCollection.update(id, patch);
  }, []);

  return { data, setStatus, updateNotes };
}

/** Create an order row from a lead (called when admin converts a lead). */
export function createOrderFromLead(lead: ManualLead, actor?: { id: string | null; label: string }) {
  const existing = ordersCollection.list().find((o) => o.lead_id === lead.id);
  if (existing) return existing;
  const order = ordersCollection.insert({
    lead_id: lead.id,
    partner_id: lead.partner_id,
    service_id: lead.service_id,
    service_name_snapshot: lead.service_name_snapshot,
    client_name: lead.client_name,
    client_whatsapp: lead.client_whatsapp,
    client_email: lead.client_email,
    status: "new",
    admin_notes: "",
    partner_visible_notes: "",
    completed_at: null,
  } as Omit<Order, "id" | "created_at" | "updated_at">);
  logAudit({
    action: "order.created",
    subject_type: "lead",
    subject_id: order.id,
    actor_id: actor?.id ?? null,
    actor_label: actor?.label ?? "admin",
    metadata: { lead_id: lead.id, client: lead.client_name, service: lead.service_name_snapshot },
  });
  return order;
}
