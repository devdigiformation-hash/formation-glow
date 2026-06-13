// Marketing angles + keywords loader.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { getServiceBySlug } from "./services";
import type { Keyword, MarketingAngle } from "./types";

async function resolveServiceId(
  serviceSlug: string | undefined,
  client: KnowledgeClient,
): Promise<string | null> {
  if (!serviceSlug) return null;
  const svc = await getServiceBySlug(serviceSlug, client);
  return svc?.id ?? null;
}

export async function listMarketingAngles(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<MarketingAngle[]> {
  const c = resolveClient(client);
  const svcId = await resolveServiceId(serviceSlug, c);
  return safeQuery<MarketingAngle[]>(
    "marketing.angles",
    () => {
      let q = c
        .from("marketing_angles")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (svcId) q = q.or(`service_id.eq.${svcId},service_id.is.null`);
      return q;
    },
    [],
  );
}

export async function listKeywords(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<Keyword[]> {
  const c = resolveClient(client);
  const svcId = await resolveServiceId(serviceSlug, c);
  return safeQuery<Keyword[]>(
    "marketing.keywords",
    () => {
      let q = c
        .from("keywords")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (svcId) q = q.or(`service_id.eq.${svcId},service_id.is.null`);
      return q;
    },
    [],
  );
}

export interface MarketingContext {
  angles: MarketingAngle[];
  keywords: Keyword[];
  hashtag_keywords: string[];
  seo_keywords: string[];
}

export async function buildMarketingContext(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<MarketingContext> {
  const [angles, keywords] = await Promise.all([
    listMarketingAngles(serviceSlug, client),
    listKeywords(serviceSlug, client),
  ]);
  return {
    angles,
    keywords,
    hashtag_keywords: keywords.filter((k) => k.keyword.startsWith("#")).map((k) => k.keyword),
    seo_keywords: keywords.filter((k) => !k.keyword.startsWith("#")).map((k) => k.keyword),
  };
}
