// =============================================================================
// DigiFormation Affiliate Hub — Data Layer (types)
// -----------------------------------------------------------------------------
// These TypeScript shapes mirror the Supabase schema 1:1. The local
// implementation in `./store` persists them to localStorage today, but each
// hook in `./hooks/*` is structured so it can be swapped to a Supabase query
// without touching any UI component.
//
// Field naming uses snake_case to match Postgres conventions, so the swap to
// `supabase.from('<table>').select()` is mechanical.
// =============================================================================

export type UUID = string;
export type ISODate = string; // ISO-8601 timestamp string

// ---------- partners --------------------------------------------------------
export type PartnerStatus = "active" | "pending" | "suspended";

export interface Partner {
  id: UUID;
  user_id: UUID | null;        // Supabase auth.users.id
  full_name: string;
  brand_name: string;
  logo_url: string | null;     // Supabase Storage URL later
  whatsapp: string;
  email: string;
  website: string | null;
  primary_color: string;       // hex #rrggbb
  secondary_color: string;     // hex #rrggbb
  social_links: Record<string, string>; // { instagram, facebook, linkedin, tiktok, x, youtube }
  status: PartnerStatus;
  created_at: ISODate;
  updated_at: ISODate;
}

// ---------- services --------------------------------------------------------
export type ServiceCategory =
  | "Company Formation"
  | "Compliance"
  | "Banking"
  | "Payments"
  | "Digital";

export interface Service {
  id: UUID;
  name: string;
  category: ServiceCategory | string;
  description: string;
  commission_amount_gbp: number;
  is_active: boolean;
  created_at: ISODate;
  region?: "UK" | "USA" | "Global";
  currency?: "GBP" | "USD";
  retail_price?: number;
  b2b_price?: number | null;
  badge?: string;
}

// ---------- manual_leads ----------------------------------------------------
export type LeadStatus = "new" | "contacted" | "converted" | "rejected";

export interface ManualLead {
  id: UUID;
  partner_id: UUID;
  client_name: string;
  client_whatsapp: string;
  client_email: string;
  service_id: UUID | null;
  service_name_snapshot: string;   // denormalised — survives service deletion
  quoted_price_gbp: number | null;
  notes: string;
  status: LeadStatus;
  estimated_commission_gbp: number;
  created_at: ISODate;
  updated_at: ISODate;
}

// ---------- commissions -----------------------------------------------------
export type CommissionStatus = "pending" | "approved" | "delayed" | "paid" | "rejected";
export type PayoutMethod = "manual_bank_transfer" | "paypal" | "wise" | null;

export interface Commission {
  id: UUID;
  partner_id: UUID;
  lead_id: UUID | null;
  service_id: UUID | null;
  amount_gbp: number;
  status: CommissionStatus;
  payout_method: PayoutMethod;
  paid_at: ISODate | null;
  admin_note?: string | null;
  created_at: ISODate;
}

// ---------- orders ----------------------------------------------------------
export type OrderStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "waiting_documents"
  | "completed"
  | "cancelled";

export interface Order {
  id: UUID;
  lead_id: UUID | null;
  partner_id: UUID;
  service_id: UUID | null;
  service_name_snapshot: string;
  client_name: string;
  client_whatsapp: string;
  client_email: string;
  status: OrderStatus;
  admin_notes: string;
  partner_visible_notes: string;
  completed_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

// ---------- admin_creatives -------------------------------------------------
export interface AdminCreative {
  id: UUID;
  title: string;
  category: string;
  service_name: string;
  image_url: string | null;     // Supabase Storage URL
  description: string;
  tagline: string;
  tags: string[];
  master_message: string;       // full marketing message admin pasted in
  uploaded_by: UUID | null;
  is_archived: boolean;
  created_at: ISODate;
}

// ---------- generated_creatives ---------------------------------------------
export type CreativePlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "twitter"
  | "whatsapp"
  | "generic";

export interface GeneratedCreative {
  id: UUID;
  partner_id: UUID;
  source_creative_id: UUID | null;
  output_image_url: string;        // data URL or Storage URL
  platform: CreativePlatform;
  size: string;                    // e.g. "1080x1080"
  mode: "quick" | "ai_smart";
  title: string | null;
  headline: string | null;         // bold-italic Unicode headline
  cta: string | null;              // short CTA line
  caption: string | null;          // full 8-block caption
  description: string | null;
  hashtags: string[];
  external_prompt: string | null;  // master prompt for ChatGPT/Gemini/Lovable/Ideogram
  service_id: UUID | null;         // FK -> services.id
  style_version: string;           // caption style version (default "v1")
  created_at: ISODate;
}


// ---------- ai_usage --------------------------------------------------------
export type AIProvider = "pollinations" | "lovable" | "gemini" | "huggingface" | "replicate";

export interface AIUsage {
  id: UUID;
  partner_id: UUID;
  provider: AIProvider | string;
  model: string;
  success: boolean;
  error_message: string | null;
  created_at: ISODate;
}

// ---------- downloads -------------------------------------------------------
export type DownloadFileType = "png" | "jpg" | "pdf" | "mp4" | "zip" | "other";

export interface Download {
  id: UUID;
  partner_id: UUID;
  creative_id: UUID | null;
  file_type: DownloadFileType;
  downloaded_at: ISODate;
  created_at: ISODate; // mirrors downloaded_at — kept for generic store
}

// ---------- audit_log ------------------------------------------------------
export type AuditAction =
  | "lead.created"
  | "lead.converted"
  | "lead.status_changed"
  | "order.created"
  | "order.status_changed"
  | "order.completed"
  | "commission.approved"
  | "commission.delayed"
  | "commission.rejected"
  | "commission.paid";

export interface AuditLog {
  id: UUID;
  actor_id: UUID | null;          // partner_id or admin user id
  actor_label: string;            // human-readable (email or brand name)
  action: AuditAction;
  subject_type: "lead" | "commission" | "partner";
  subject_id: UUID;
  metadata: Record<string, unknown>;
  created_at: ISODate;
}

// =============================================================================
// Input DTOs — what callers pass to `create()` mutators. Server-managed
// fields (id, timestamps) are filled by the store layer.
// =============================================================================
export type PartnerInput = Omit<Partner, "id" | "created_at" | "updated_at">;
export type ServiceInput = Omit<Service, "id" | "created_at">;
export type ManualLeadInput = Omit<ManualLead, "id" | "created_at" | "updated_at">;
export type CommissionInput = Omit<Commission, "id" | "created_at">;
export type AdminCreativeInput = Omit<AdminCreative, "id" | "created_at">;
export type GeneratedCreativeInput = Omit<GeneratedCreative, "id" | "created_at">;
export type AIUsageInput = Omit<AIUsage, "id" | "created_at">;
export type DownloadInput = Omit<Download, "id" | "downloaded_at" | "created_at">;
export type AuditLogInput = Omit<AuditLog, "id" | "created_at">;
