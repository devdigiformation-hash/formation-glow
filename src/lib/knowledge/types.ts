// =============================================================================
// DigiFormation Knowledge System — shared TypeScript types
// Mirror the public.* tables seeded in Phase 2.A–2.H. Used by every loader
// and context builder under src/lib/knowledge/.
// =============================================================================

export type UUID = string;
export type ISODate = string;

export interface ServiceCategory {
  id: UUID;
  slug: string;
  label: string;
  description: string | null;
  sort_order: number;
  icon: string | null;
}

export interface Service {
  id: UUID;
  name: string;
  slug: string | null;
  category: string;
  category_id: UUID | null;
  short_desc: string | null;
  long_desc: string | null;
  description: string;
  hero_image_url: string | null;
  public_url: string | null;
  currency: string;
  price_from: number | null;
  price_unit: string | null;
  turnaround_days_min: number | null;
  turnaround_days_max: number | null;
  requires_jurisdiction: boolean;
  status: string;
  sort_order: number;
  meta: Record<string, unknown>;
  is_active: boolean;
}

export interface ServicePackage {
  id: UUID;
  service_id: UUID;
  tier: string;
  price: number | null;
  currency: string;
  processing_days: string | null;
  is_popular: boolean;
  sort_order: number;
  meta: Record<string, unknown>;
}

export interface PackageFeature {
  id: UUID;
  package_id: UUID;
  label: string;
  included: boolean;
  note: string | null;
  sort_order: number;
}

export interface PackageWithFeatures extends ServicePackage {
  features: PackageFeature[];
}

export interface Jurisdiction {
  id: UUID;
  service_id: UUID;
  code: string;
  label: string;
  surcharge: number | null;
  currency: string;
  processing_days: string | null;
  notes: string | null;
  sort_order: number;
  status: string;
}

export interface RequiredDocument {
  id: UUID;
  service_id: UUID;
  document_label: string;
  applies_to: string | null;
  required: boolean;
  guidance: string | null;
  sort_order: number;
  status: string;
}

export interface FAQ {
  id: UUID;
  category: string | null;
  question: string;
  answer_md: string | null;
  source_url: string | null;
  published: boolean;
  sort_order: number;
}

export interface ContentItem {
  id: UUID;
  type: string;
  title: string;
  url: string | null;
  summary: string | null;
  hero_image_url: string | null;
  service_ids: UUID[];
  keywords: string[];
  published_at: string | null;
  status: string;
}

export interface BankingPaymentPartner {
  id: UUID;
  service_id: UUID | null;
  provider_slug: string;
  name: string;
  logo_url: string | null;
  supported_countries: string[];
  supported_company_types: string[];
  typical_approval_days: string | null;
  account_type: string | null;
  setup_fee: number | null;
  currency: string | null;
  pros: string[];
  cons: string[];
  common_rejection_reasons: string[];
  documents_needed: string[];
  notes_md: string | null;
  status: string;
  sort_order: number;
}

export interface MarketingAngle {
  id: UUID;
  service_id: UUID | null;
  angle: string;
  audience: string | null;
  pain_point: string | null;
  promise: string | null;
  proof: string | null;
  cta: string | null;
  tone: string | null;
  channels: string[];
  status: string;
  sort_order: number;
}

export interface Keyword {
  id: UUID;
  service_id: UUID | null;
  keyword: string;
  intent: string | null;
  match_type: string | null;
  locale: string;
  volume_band: string | null;
  notes: string | null;
  status: string;
  sort_order: number;
}

export interface PublishingGuide {
  id: UUID;
  platform: string;
  service_id: UUID | null;
  title: string;
  best_format: string | null;
  optimal_specs: Record<string, unknown>;
  post_template_md: string | null;
  hashtag_strategy: string | null;
  do_dont_md: string | null;
  examples: string[];
  status: string;
  sort_order: number;
}

export interface FacebookAdsGuide {
  id: UUID;
  service_id: UUID | null;
  objective: string | null;
  audience_targeting: Record<string, unknown>;
  creative_format: string | null;
  primary_text_template: string | null;
  headline_template: string | null;
  description_template: string | null;
  cta_button: string | null;
  budget_guidance: string | null;
  landing_url_pattern: string | null;
  pixel_event: string | null;
  compliance_notes: string | null;
  status: string;
  sort_order: number;
}

/** Safe subset exposed by the get_my_terms() SECURITY DEFINER function. */
export interface PartnerTermSafe {
  service_id: UUID | null;
  package_id: UUID | null;
  partner_tier: string | null;
  commission_pct: number | null;
  commission_flat: number | null;
  payout_cadence: string | null;
  min_payout: number | null;
  currency: string | null;
  status: string;
}

export interface BrandAsset {
  id: UUID;
  owner: "digiformation" | "partner";
  partner_id: UUID | null;
  kind: string;
  label: string;
  value: string | null;
  file_url: string | null;
  meta: Record<string, unknown>;
  status: string | null;
}

/** Sentinel used by every context builder when a price field is missing. */
export const PRICE_UNAVAILABLE = "Contact DigiFormation for pricing";

/** Combined service + packages + jurisdictions + docs context blob. */
export interface ServiceKnowledgeContext {
  service: Service | null;
  packages: PackageWithFeatures[];
  jurisdictions: Jurisdiction[];
  required_documents: RequiredDocument[];
  display_price: string;
}
