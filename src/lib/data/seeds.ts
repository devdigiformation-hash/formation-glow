// =============================================================================
// Seed data for the local stores. Replaces hard-coded sample data scattered
// in routes. Each seed mirrors what a Supabase initial migration / seed.sql
// would insert for a fresh DigiFormation Affiliate Hub workspace.
// =============================================================================

import { SERVICES } from "@/lib/commission";
import type {
  AdminCreative,
  Commission,
  GeneratedCreative,
  ManualLead,
  Partner,
  Service,
} from "./types";

const t = (offsetMs: number) => new Date(Date.now() - offsetMs).toISOString();

// ---- partners --------------------------------------------------------------
// In the absence of real auth, every session uses this single partner row.
export const CURRENT_PARTNER_ID = "partner-current";

export const SEED_PARTNERS: Partner[] = [
  {
    id: CURRENT_PARTNER_ID,
    user_id: null,
    full_name: "DigiFormation Partner",
    brand_name: "Your Brand",
    logo_url: null,
    whatsapp: "+44 7700 900000",
    email: "partner@example.com",
    website: null,
    primary_color: "#22d3ee",
    secondary_color: "#a78bfa",
    social_links: {},
    status: "active",
    created_at: t(86400000 * 30),
    updated_at: t(0),
  },
];

// ---- services --------------------------------------------------------------
export const SEED_SERVICES: Service[] = SERVICES.map((s, i) => ({
  id: `svc-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: s.name,
  category: s.category,
  description: s.description,
  commission_amount_gbp: s.b2b != null ? Math.max(0, s.retail - s.b2b) : 20,
  is_active: true,
  created_at: t(86400000 * (60 - i)),
  region: s.region,
  currency: s.currency,
  retail_price: s.retail,
  b2b_price: s.b2b,
  badge: s.badge,
}));

const svcId = (name: string) =>
  SEED_SERVICES.find((s) => s.name === name)?.id ?? null;

// ---- manual_leads ----------------------------------------------------------
// Fresh installs start empty — no fake leads, no fake activity.
export const SEED_MANUAL_LEADS: ManualLead[] = [];

// ---- commissions -----------------------------------------------------------
// Fresh installs start empty — no fake earnings or payouts.
export const SEED_COMMISSIONS: Commission[] = [];

// ---- admin_creatives -------------------------------------------------------
// Authoritative source for Admin Creative Library is the legacy
// `digiform.admin.creatives.v1` key (creatives-store.ts). This array is the
// structural fallback for the future Supabase shape.
export const SEED_ADMIN_CREATIVES: AdminCreative[] = [];

// ---- generated_creatives ---------------------------------------------------
export const SEED_GENERATED_CREATIVES: GeneratedCreative[] = [];
