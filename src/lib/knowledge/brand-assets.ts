// Brand assets loader — DigiFormation global + partner-owned assets.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import type { BrandAsset } from "./types";

export async function getDigiFormationBrandAssets(
  client?: KnowledgeClient,
): Promise<BrandAsset[]> {
  const c = resolveClient(client);
  return safeQuery<BrandAsset[]>(
    "brand.digiformation",
    () =>
      c
        .from("brand_assets")
        .select("*")
        .eq("owner", "digiformation")
        .eq("status", "active"),
    [],
  );
}

export async function getPartnerBrandAssets(
  partnerId: string,
  client?: KnowledgeClient,
): Promise<BrandAsset[]> {
  const c = resolveClient(client);
  return safeQuery<BrandAsset[]>(
    "brand.partner",
    () =>
      c
        .from("brand_assets")
        .select("*")
        .eq("owner", "partner")
        .eq("partner_id", partnerId),
    [],
  );
}

export interface BrandContext {
  digiformation: BrandAsset[];
  partner: BrandAsset[];
  /** Quick lookup map: kind → first matching asset value. */
  partner_tokens: Record<string, string | null>;
  digiformation_tokens: Record<string, string | null>;
}

function tokenize(assets: BrandAsset[]): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const a of assets) {
    if (!(a.kind in out)) out[a.kind] = a.value ?? a.file_url ?? null;
  }
  return out;
}

export async function buildBrandContext(
  partnerId: string | null,
  client?: KnowledgeClient,
): Promise<BrandContext> {
  const [digiformation, partner] = await Promise.all([
    getDigiFormationBrandAssets(client),
    partnerId ? getPartnerBrandAssets(partnerId, client) : Promise.resolve([] as BrandAsset[]),
  ]);
  return {
    digiformation,
    partner,
    digiformation_tokens: tokenize(digiformation),
    partner_tokens: tokenize(partner),
  };
}
