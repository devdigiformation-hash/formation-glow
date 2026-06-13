// High-level context builders used by AI tools (Affiliate Assistant,
// Rebrand Studio, Marketing Pack, External Prompt deck, Distribution hub).
//
// Each builder composes the per-table loaders into a single serializable
// blob that an AI prompt or UI panel can consume.
//
// Price safety: every builder relies on the per-loader display_* helpers
// that already substitute PRICE_UNAVAILABLE when a price field is missing.
// Builders MUST NOT compute or guess prices on their own.
import type { KnowledgeClient } from "./client";
import { buildBrandContext, type BrandContext } from "./brand-assets";
import { buildContentContext, getFAQContext, type ContentContext, type FAQContext } from "./faqs";
import { buildMarketingContext, type MarketingContext } from "./marketing";
import { getSafePartnerTerms } from "./partner-terms";
import {
  buildPackageComparison,
  type PackageComparisonRow,
} from "./packages";
import {
  buildPublishingContext,
  type PublishingContext,
} from "./publishing";
import { getServiceKnowledgeContext } from "./services";
import {
  PRICE_UNAVAILABLE,
  type PartnerTermSafe,
  type ServiceKnowledgeContext,
} from "./types";

export interface BaseInput {
  serviceSlug?: string;
  partnerId?: string | null;
  /** When true, include safe partner terms (commission, payout). */
  includePartnerTerms?: boolean;
  client?: KnowledgeClient;
}

export interface AffiliateAssistantContext {
  service: ServiceKnowledgeContext;
  packages: PackageComparisonRow[];
  marketing: MarketingContext;
  faqs: FAQContext;
  brand: BrandContext;
  partner_terms: PartnerTermSafe[];
  price_policy: string;
}

export async function buildAffiliateAssistantContext(
  input: BaseInput,
): Promise<AffiliateAssistantContext> {
  const { serviceSlug, partnerId = null, includePartnerTerms = false, client } = input;
  const [service, packages, marketing, faqs, brand, partner_terms] = await Promise.all([
    serviceSlug
      ? getServiceKnowledgeContext(serviceSlug, client)
      : Promise.resolve({
          service: null,
          packages: [],
          jurisdictions: [],
          required_documents: [],
          display_price: PRICE_UNAVAILABLE,
        } as ServiceKnowledgeContext),
    serviceSlug ? buildPackageComparison(serviceSlug, client) : Promise.resolve([]),
    buildMarketingContext(serviceSlug, client),
    getFAQContext(serviceSlug, client),
    buildBrandContext(partnerId, client),
    includePartnerTerms
      ? getSafePartnerTerms(serviceSlug, client)
      : Promise.resolve([] as PartnerTermSafe[]),
  ]);
  return {
    service,
    packages,
    marketing,
    faqs,
    brand,
    partner_terms,
    price_policy: PRICE_UNAVAILABLE,
  };
}

export interface RebrandContext {
  service: ServiceKnowledgeContext;
  packages: PackageComparisonRow[];
  marketing: MarketingContext;
  brand: BrandContext;
  price_policy: string;
}

export async function buildRebrandContext(input: BaseInput): Promise<RebrandContext> {
  const { serviceSlug, partnerId = null, client } = input;
  const [service, packages, marketing, brand] = await Promise.all([
    serviceSlug
      ? getServiceKnowledgeContext(serviceSlug, client)
      : Promise.resolve({
          service: null,
          packages: [],
          jurisdictions: [],
          required_documents: [],
          display_price: PRICE_UNAVAILABLE,
        } as ServiceKnowledgeContext),
    serviceSlug ? buildPackageComparison(serviceSlug, client) : Promise.resolve([]),
    buildMarketingContext(serviceSlug, client),
    buildBrandContext(partnerId, client),
  ]);
  return { service, packages, marketing, brand, price_policy: PRICE_UNAVAILABLE };
}

export interface MarketingAssetContext {
  service: ServiceKnowledgeContext;
  marketing: MarketingContext;
  publishing: PublishingContext;
  brand: BrandContext;
  price_policy: string;
}

export async function buildMarketingAssetContext(
  input: BaseInput,
): Promise<MarketingAssetContext> {
  const { serviceSlug, partnerId = null, client } = input;
  const [service, marketing, publishing, brand] = await Promise.all([
    serviceSlug
      ? getServiceKnowledgeContext(serviceSlug, client)
      : Promise.resolve({
          service: null,
          packages: [],
          jurisdictions: [],
          required_documents: [],
          display_price: PRICE_UNAVAILABLE,
        } as ServiceKnowledgeContext),
    buildMarketingContext(serviceSlug, client),
    buildPublishingContext(serviceSlug, client),
    buildBrandContext(partnerId, client),
  ]);
  return { service, marketing, publishing, brand, price_policy: PRICE_UNAVAILABLE };
}

export interface ExternalPromptContext extends RebrandContext {
  content: ContentContext;
}

export async function buildExternalPromptContext(
  input: BaseInput,
): Promise<ExternalPromptContext> {
  const [base, content] = await Promise.all([
    buildRebrandContext(input),
    buildContentContext(input.serviceSlug, input.client),
  ]);
  return { ...base, content };
}
