// Partner terms — safe loader. Never selects partner_terms directly from the
// client; always goes through the SECURITY DEFINER function public.get_my_terms()
// which filters out notes_admin, b2b_price and other private fields.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { getServiceBySlug } from "./services";
import type { PartnerTermSafe } from "./types";

export async function getMyTerms(client?: KnowledgeClient): Promise<PartnerTermSafe[]> {
  const c = resolveClient(client);
  return safeQuery<PartnerTermSafe[]>(
    "partnerTerms.myTerms",
    () => c.rpc("get_my_terms"),
    [],
  );
}

/** Get safe partner terms scoped to one service. */
export async function getSafePartnerTerms(
  serviceSlug?: string,
  client?: KnowledgeClient,
): Promise<PartnerTermSafe[]> {
  const terms = await getMyTerms(client);
  if (!serviceSlug) return terms;
  const svc = await getServiceBySlug(serviceSlug, client);
  if (!svc) return [];
  return terms.filter((t) => t.service_id === svc.id);
}
