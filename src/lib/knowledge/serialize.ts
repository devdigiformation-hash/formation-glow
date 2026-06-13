// =============================================================================
// Knowledge serializers — turn loader/context output into prompt-ready text
// blocks for AI calls. Keep these PURE (no I/O) so the same helpers run in
// server functions AND in the browser.
//
// PRICE SAFETY: never compute or guess. The context builders already supply
// `display_price` and PRICE_UNAVAILABLE sentinels — we just render them.
// =============================================================================
import type {
  AffiliateAssistantContext,
  RebrandContext,
  MarketingAssetContext,
  ExternalPromptContext,
} from "./context-builders";
import type { PublishingContext } from "./publishing";
import { PRICE_UNAVAILABLE } from "./types";

function line(label: string, value: unknown): string | null {
  if (value == null || value === "") return null;
  return `${label}: ${String(value)}`;
}

function bullets(items: Array<string | null | undefined>): string {
  return items.filter((i): i is string => !!i && i.trim().length > 0)
    .map((i) => `- ${i}`)
    .join("\n");
}

export function serializeServiceBlock(ctx: AffiliateAssistantContext | RebrandContext | MarketingAssetContext): string {
  const s = ctx.service.service;
  if (!s) return "Service: (none selected — speak about DigiFormation services in general).";
  const meta = [
    line("Name", s.name),
    line("Category", s.category),
    line("Slug", s.slug),
    line("Short description", s.short_desc),
    line("Long description", s.long_desc ?? s.description),
    line("Display price", ctx.service.display_price || PRICE_UNAVAILABLE),
    line("Turnaround", s.turnaround_days_min && s.turnaround_days_max
      ? `${s.turnaround_days_min}-${s.turnaround_days_max} days`
      : null),
  ];
  const docs = ctx.service.required_documents
    .map((d) => `${d.document_label}${d.required ? " (required)" : " (optional)"}`);
  const jurisdictions = ctx.service.jurisdictions.map((j) => `${j.code} — ${j.label}`);
  return [
    "ACTIVE SERVICE:",
    bullets(meta),
    jurisdictions.length ? `\nJurisdictions:\n${bullets(jurisdictions)}` : "",
    docs.length ? `\nRequired documents:\n${bullets(docs)}` : "",
  ].filter(Boolean).join("\n");
}

export function serializePackagesBlock(ctx: AffiliateAssistantContext | RebrandContext): string {
  if (!ctx.packages.length) return "";
  const rows = ctx.packages.map((p) => {
    const features = (p.features ?? []).filter(Boolean).join("; ");
    return `- ${p.tier} — ${p.display_price || PRICE_UNAVAILABLE}${features ? ` (${features})` : ""}`;
  });
  return `PACKAGES:\n${rows.join("\n")}`;
}

export function serializeMarketingBlock(ctx: AffiliateAssistantContext | RebrandContext | MarketingAssetContext): string {
  const angles = ctx.marketing.angles.slice(0, 8).map((a) =>
    `- ${a.angle}${a.audience ? ` [aud: ${a.audience}]` : ""}${a.cta ? ` → CTA: ${a.cta}` : ""}`,
  );
  const seo = ctx.marketing.seo_keywords.slice(0, 25).join(", ");
  const tags = ctx.marketing.hashtag_keywords.slice(0, 25).join(" ");
  return [
    angles.length ? `MARKETING ANGLES:\n${angles.join("\n")}` : "",
    seo ? `SEO KEYWORDS: ${seo}` : "",
    tags ? `HASHTAGS: ${tags}` : "",
  ].filter(Boolean).join("\n\n");
}

export function serializeFAQBlock(ctx: AffiliateAssistantContext): string {
  if (!ctx.faqs.faqs.length) return "";
  const items = ctx.faqs.faqs.slice(0, 10).map((f) =>
    `Q: ${f.question}\nA: ${(f.answer_md ?? "").slice(0, 400)}`,
  );
  return `FAQs:\n${items.join("\n\n")}`;
}

export function serializeBrandBlock(ctx: AffiliateAssistantContext | RebrandContext | MarketingAssetContext): string {
  const partner = ctx.brand.partner;
  if (!partner.length) return "";
  const items = partner.map((b) => `- ${b.kind}: ${b.label}${b.value ? ` = ${b.value}` : ""}`);
  return `PARTNER BRAND ASSETS:\n${items.join("\n")}`;
}

export function serializePublishingBlock(pub: PublishingContext, platform?: string): string {
  const guides = (platform
    ? pub.guides.filter((g) => g.platform.toLowerCase() === platform.toLowerCase())
    : pub.guides
  ).slice(0, 6);
  const fb = pub.facebook_ads.slice(0, 3);
  const guideLines = guides.map((g) =>
    `- ${g.platform} (${g.title}) ${g.best_format ? `· ${g.best_format}` : ""} ${g.hashtag_strategy ? `· tags: ${g.hashtag_strategy}` : ""}`,
  );
  const fbLines = fb.map((f) =>
    `- objective=${f.objective ?? "n/a"}; CTA=${f.cta_button ?? "n/a"}; budget=${f.budget_guidance ?? "n/a"}`,
  );
  return [
    guideLines.length ? `PUBLISHING GUIDES:\n${guideLines.join("\n")}` : "",
    fbLines.length ? `FACEBOOK ADS GUIDES:\n${fbLines.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
}

const PRICE_RULE = `PRICE SAFETY RULES (mandatory):
- Never invent prices, commissions, or B2B rates.
- If a price is missing, write exactly: "${PRICE_UNAVAILABLE}".
- Never expose internal admin notes or B2B economics.`;

export function buildAffiliateAssistantPrompt(ctx: AffiliateAssistantContext): string {
  return [
    "DIGIFORMATION KNOWLEDGE CONTEXT (database-driven):",
    serializeServiceBlock(ctx),
    serializePackagesBlock(ctx),
    serializeMarketingBlock(ctx),
    serializeFAQBlock(ctx),
    serializeBrandBlock(ctx),
    PRICE_RULE,
  ].filter(Boolean).join("\n\n");
}

export function buildRebrandPrompt(ctx: RebrandContext): string {
  return [
    "DIGIFORMATION REBRAND CONTEXT (database-driven):",
    serializeServiceBlock(ctx),
    serializePackagesBlock(ctx),
    serializeMarketingBlock(ctx),
    serializeBrandBlock(ctx),
    PRICE_RULE,
  ].filter(Boolean).join("\n\n");
}

export function buildMarketingAssetPrompt(ctx: MarketingAssetContext, platform?: string): string {
  return [
    "DIGIFORMATION MARKETING CONTEXT (database-driven):",
    serializeServiceBlock(ctx),
    serializeMarketingBlock(ctx),
    serializePublishingBlock(ctx.publishing, platform),
    serializeBrandBlock(ctx),
    PRICE_RULE,
  ].filter(Boolean).join("\n\n");
}

export function buildExternalPromptBlock(ctx: ExternalPromptContext): string {
  return [
    "DIGIFORMATION CONTEXT (database-driven):",
    serializeServiceBlock(ctx),
    serializePackagesBlock(ctx),
    serializeMarketingBlock(ctx),
    serializeBrandBlock(ctx),
    PRICE_RULE,
  ].filter(Boolean).join("\n\n");
}
