// =============================================================================
// Knowledge System — authenticated server-fn wrappers.
//
// Components (external-ai-deck, distribution-panel) need DB-driven knowledge
// at render time. The context builders are server-friendly but rely on a
// Supabase client; we surface them here as `createServerFn` endpoints so the
// browser can fetch them via `useServerFn` + `useQuery`.
//
// Returns are JSON-stringified to sidestep TanStack Start's strict
// `Record<string, unknown>` serialization checker. Callers wrap with the
// `parseJson` helper to get back the typed structure.
// =============================================================================
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildAffiliateAssistantContext,
  buildExternalPromptContext,
  buildMarketingAssetContext,
  buildPublishingContext,
  buildRebrandContext,
} from "./knowledge";
import type {
  AffiliateAssistantContext,
  ExternalPromptContext,
  MarketingAssetContext,
  RebrandContext,
} from "./knowledge/context-builders";
import type { PublishingContext } from "./knowledge/publishing";

type SlugInput = { serviceSlug?: string; includePartnerTerms?: boolean };

export function parseKnowledgeJson<T>(payload: { json: string }): T {
  try { return JSON.parse(payload.json) as T; } catch { return {} as T; }
}

export const fetchAffiliateAssistantContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => (input ?? {}) as SlugInput)
  .handler(async ({ data, context }) => {
    const ctx = await buildAffiliateAssistantContext({
      serviceSlug: data.serviceSlug,
      partnerId: context.userId,
      includePartnerTerms: !!data.includePartnerTerms,
      client: context.supabase,
    });
    return { json: JSON.stringify(ctx) };
  });

export const fetchRebrandContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => (input ?? {}) as SlugInput)
  .handler(async ({ data, context }) => {
    const ctx = await buildRebrandContext({
      serviceSlug: data.serviceSlug,
      partnerId: context.userId,
      client: context.supabase,
    });
    return { json: JSON.stringify(ctx) };
  });

export const fetchMarketingAssetContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => (input ?? {}) as SlugInput)
  .handler(async ({ data, context }) => {
    const ctx = await buildMarketingAssetContext({
      serviceSlug: data.serviceSlug,
      partnerId: context.userId,
      client: context.supabase,
    });
    return { json: JSON.stringify(ctx) };
  });

export const fetchExternalPromptContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => (input ?? {}) as SlugInput)
  .handler(async ({ data, context }) => {
    const ctx = await buildExternalPromptContext({
      serviceSlug: data.serviceSlug,
      partnerId: context.userId,
      client: context.supabase,
    });
    return { json: JSON.stringify(ctx) };
  });

export const fetchPublishingContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => (input ?? {}) as SlugInput)
  .handler(async ({ data, context }) => {
    const ctx = await buildPublishingContext(data.serviceSlug, context.supabase);
    return { json: JSON.stringify(ctx) };
  });

export type { AffiliateAssistantContext, ExternalPromptContext, MarketingAssetContext, RebrandContext, PublishingContext };
