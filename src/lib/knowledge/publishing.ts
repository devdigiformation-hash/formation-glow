// Publishing + Facebook ads guides loader.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { getServiceBySlug } from "./services";
import type { FacebookAdsGuide, PublishingGuide } from "./types";

export async function listPublishingGuides(
  platform?: string,
  client?: KnowledgeClient,
): Promise<PublishingGuide[]> {
  const c = resolveClient(client);
  return safeQuery<PublishingGuide[]>(
    "publishing.list",
    () => {
      let q = c
        .from("publishing_guides")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (platform) q = q.eq("platform", platform);
      return q;
    },
    [],
  );
}

export async function getPublishingGuide(
  platform: string,
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<PublishingGuide | null> {
  const c = resolveClient(client);
  let svcId: string | null = null;
  if (serviceSlug) {
    const svc = await getServiceBySlug(serviceSlug, c);
    svcId = svc?.id ?? null;
  }
  return safeQuery<PublishingGuide | null>(
    "publishing.get",
    () => {
      let q = c
        .from("publishing_guides")
        .select("*")
        .eq("status", "published")
        .eq("platform", platform)
        .order("sort_order", { ascending: true })
        .limit(1);
      if (svcId) q = q.eq("service_id", svcId);
      return q.maybeSingle();
    },
    null,
  );
}

export async function listFacebookAdsGuides(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<FacebookAdsGuide[]> {
  const c = resolveClient(client);
  let svcId: string | null = null;
  if (serviceSlug) {
    const svc = await getServiceBySlug(serviceSlug, c);
    svcId = svc?.id ?? null;
  }
  return safeQuery<FacebookAdsGuide[]>(
    "publishing.fb",
    () => {
      let q = c
        .from("facebook_ads_guides")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (svcId) q = q.eq("service_id", svcId);
      return q;
    },
    [],
  );
}

export interface PublishingContext {
  guides: PublishingGuide[];
  facebook_ads: FacebookAdsGuide[];
}

export async function buildPublishingContext(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<PublishingContext> {
  const [guides, facebook_ads] = await Promise.all([
    listPublishingGuides(undefined, client),
    listFacebookAdsGuides(serviceSlug, client),
  ]);
  return { guides, facebook_ads };
}
