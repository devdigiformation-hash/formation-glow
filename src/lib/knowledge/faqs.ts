// FAQs + content library loader.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { getServiceBySlug } from "./services";
import type { ContentItem, FAQ } from "./types";

export async function listFAQs(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<FAQ[]> {
  const c = resolveClient(client);
  if (!serviceSlug) {
    return safeQuery<FAQ[]>(
      "faqs.all",
      () =>
        c
          .from("faqs")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true }),
      [],
    );
  }
  const svc = await getServiceBySlug(serviceSlug, c);
  if (!svc) return [];
  // Faqs scoped to a service via faq_services junction.
  const links = await safeQuery<{ faq_id: string }[]>(
    "faqs.links",
    () => c.from("faq_services").select("faq_id").eq("service_id", svc.id),
    [],
  );
  if (!links.length) return [];
  return safeQuery<FAQ[]>(
    "faqs.byService",
    () =>
      c
        .from("faqs")
        .select("*")
        .in(
          "id",
          links.map((l) => l.faq_id),
        )
        .eq("published", true)
        .order("sort_order", { ascending: true }),
    [],
  );
}

export interface FAQContext {
  faqs: FAQ[];
  has_answers: boolean;
}

export async function getFAQContext(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<FAQContext> {
  const faqs = await listFAQs(serviceSlug, client);
  return { faqs, has_answers: faqs.some((f) => !!f.answer_md) };
}

export async function listContentByService(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<ContentItem[]> {
  const c = resolveClient(client);
  if (!serviceSlug) {
    return safeQuery<ContentItem[]>(
      "content.all",
      () =>
        c
          .from("content_library")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
      [],
    );
  }
  const svc = await getServiceBySlug(serviceSlug, c);
  if (!svc) return [];
  return safeQuery<ContentItem[]>(
    "content.byService",
    () =>
      c
        .from("content_library")
        .select("*")
        .eq("status", "published")
        .contains("service_ids", [svc.id])
        .order("published_at", { ascending: false }),
    [],
  );
}

export interface ContentContext {
  items: ContentItem[];
  count: number;
}

export async function buildContentContext(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<ContentContext> {
  const items = await listContentByService(serviceSlug, client);
  return { items, count: items.length };
}
