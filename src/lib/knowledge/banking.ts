// Banking + payment providers loader.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { PRICE_UNAVAILABLE, type BankingPaymentPartner } from "./types";

const PROVIDER_COLS =
  "id,service_id,provider_slug,name,logo_url,supported_countries,supported_company_types,typical_approval_days,account_type,setup_fee,currency,pros,cons,common_rejection_reasons,documents_needed,notes_md,status,sort_order";

async function listProvidersByCategory(
  category: "Banking" | "Payments",
  client?: KnowledgeClient,
): Promise<BankingPaymentPartner[]> {
  const c = resolveClient(client);
  // Join through services.category to split banking vs payment providers.
  const svcIds = await safeQuery<{ id: string }[]>(
    `banking.list.${category}.svc`,
    () => c.from("services").select("id").eq("category", category),
    [],
  );
  if (!svcIds.length) return [];
  return safeQuery<BankingPaymentPartner[]>(
    `banking.list.${category}`,
    () =>
      c
        .from("banking_payment_partners")
        .select(PROVIDER_COLS)
        .eq("status", "published")
        .in(
          "service_id",
          svcIds.map((s) => s.id),
        )
        .order("sort_order", { ascending: true }),
    [],
  );
}

export function listBankingProviders(client?: KnowledgeClient) {
  return listProvidersByCategory("Banking", client);
}

export function listPaymentProviders(client?: KnowledgeClient) {
  return listProvidersByCategory("Payments", client);
}

export async function listAllProviders(
  client?: KnowledgeClient,
): Promise<BankingPaymentPartner[]> {
  const c = resolveClient(client);
  return safeQuery<BankingPaymentPartner[]>(
    "banking.listAll",
    () =>
      c
        .from("banking_payment_partners")
        .select(PROVIDER_COLS)
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
    [],
  );
}

export async function getProviderBySlug(
  providerSlug: string,
  client?: KnowledgeClient,
): Promise<BankingPaymentPartner | null> {
  const c = resolveClient(client);
  return safeQuery<BankingPaymentPartner | null>(
    "banking.bySlug",
    () =>
      c
        .from("banking_payment_partners")
        .select(PROVIDER_COLS)
        .eq("provider_slug", providerSlug)
        .maybeSingle(),
    null,
  );
}

export interface ProviderContext {
  provider: BankingPaymentPartner | null;
  display_setup_fee: string;
  countries_summary: string;
}

export async function buildProviderContext(
  providerSlug: string,
  client?: KnowledgeClient,
): Promise<ProviderContext> {
  const provider = await getProviderBySlug(providerSlug, client);
  if (!provider) {
    return { provider: null, display_setup_fee: PRICE_UNAVAILABLE, countries_summary: "" };
  }
  const sym =
    provider.currency === "USD" ? "$" : provider.currency === "GBP" ? "£" : provider.currency ?? "";
  const display_setup_fee =
    provider.setup_fee == null ? PRICE_UNAVAILABLE : `${sym}${provider.setup_fee}`;
  return {
    provider,
    display_setup_fee,
    countries_summary: provider.supported_countries.join(", "),
  };
}
