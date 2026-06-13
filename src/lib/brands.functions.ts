// =============================================================================
// Brand Library — server functions for the Build Brand Manager.
//
// Partners can save unlimited brands in their library. Exactly ONE brand may
// be "active" at a time. Activating a brand also mirrors its identity into
// the partner's profile so the rest of the platform (Rebrand Studio,
// Marketing Guide, AI Assistant, Orders, Earnings) uses it automatically.
// =============================================================================

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BrandRow = {
  id: string;
  partner_id: string;
  name: string;
  brand_type: string;
  meaning_en: string | null;
  meaning_ur: string | null;
  theme: string;
  logo_prompt: string | null;
  logo_url: string | null;
  facebook_handle: string | null;
  instagram_handle: string | null;
  tagline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateBrandInput = {
  name: string;
  brand_type?: string;
  meaning_en?: string;
  meaning_ur?: string;
  theme?: string;
  logo_prompt?: string;
  logo_url?: string;
  facebook_handle?: string;
  instagram_handle?: string;
  tagline?: string;
  set_active?: boolean;
  theme_primary?: string;
  theme_secondary?: string;
};

const s = (v: unknown, max = 500): string | null => {
  if (v === undefined || v === null) return null;
  const str = String(v).trim();
  return str.length === 0 ? null : str.slice(0, max);
};

function inferThemeFromProfileColor(color: string | null): string {
  const c = (color ?? "").trim().toLowerCase();
  if (["#06b6d4", "#22d3ee", "cyan"].includes(c)) return "cyan";
  if (["#7c3aed", "#a78bfa", "purple"].includes(c)) return "purple";
  if (["#16a34a", "#059669", "green", "emerald"].includes(c)) return "emerald";
  if (["#0d9488", "teal"].includes(c)) return "teal";
  if (["#d4a017", "gold"].includes(c)) return "gold";
  if (["#ff7a1a", "orange"].includes(c)) return "orange";
  if (["#dc2626", "red"].includes(c)) return "red";
  if (["#1e3a8a", "navy"].includes(c)) return "navy";
  if (["#a3a3a3", "silver"].includes(c)) return "silver";
  if (["#374151", "charcoal"].includes(c)) return "charcoal";
  return "cyan";
}

// ---------------------------------------------------------------------------
// listBrands
// ---------------------------------------------------------------------------
export const listBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BrandRow[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("partner_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BrandRow[];
  });

// ---------------------------------------------------------------------------
// ensureActiveBrandFromProfile — legacy/profile fallback.
// If a partner already completed Partner Profile before Brand Library existed,
// their profile brand is automatically imported as the Active Brand.
// ---------------------------------------------------------------------------
export const ensureActiveBrandFromProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BrandRow | null> => {
    const { supabase, userId } = context;

    const { data: activeRows, error: activeErr } = await supabase
      .from("brands")
      .select("*")
      .eq("partner_id", userId)
      .eq("is_active", true)
      .limit(1);
    if (activeErr) throw new Error(activeErr.message);
    if (activeRows?.[0]) return activeRows[0] as BrandRow;

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, brand_name, logo_url, primary_color, secondary_color, social_links")
      .eq("id", userId)
      .maybeSingle();
    if (profileErr) throw new Error(profileErr.message);

    const brandName = s((profile as any)?.brand_name, 200);
    if (!brandName) return null;

    const social = (((profile as any)?.social_links ?? {}) as Record<string, string>);
    const theme = inferThemeFromProfileColor(
      s((profile as any)?.secondary_color, 20) ?? s((profile as any)?.primary_color, 20),
    );

    const { data: existingRows, error: existingErr } = await supabase
      .from("brands")
      .select("*")
      .eq("partner_id", userId)
      .eq("name", brandName)
      .limit(1);
    if (existingErr) throw new Error(existingErr.message);

    if (existingRows?.[0]) {
      const { data: row, error } = await supabase
        .from("brands")
        .update({
          is_active: true,
          logo_url: s((profile as any)?.logo_url, 1000),
          facebook_handle: s(social.facebook, 200),
          instagram_handle: s(social.instagram, 200),
          theme,
        })
        .eq("id", (existingRows[0] as BrandRow).id)
        .eq("partner_id", userId)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row as BrandRow;
    }

    const { data: row, error } = await supabase
      .from("brands")
      .insert({
        partner_id: userId,
        name: brandName,
        brand_type: "formation",
        meaning_en: "Imported from your Partner Profile.",
        meaning_ur: null,
        theme,
        logo_prompt: null,
        logo_url: s((profile as any)?.logo_url, 1000),
        facebook_handle: s(social.facebook, 200),
        instagram_handle: s(social.instagram, 200),
        tagline: null,
        is_active: true,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as BrandRow;
  });

// ---------------------------------------------------------------------------
// createBrand — inserts a new brand row. If set_active is true (or it's the
// first brand the partner has), also marks it active and mirrors identity
// into the partner's profile.
// ---------------------------------------------------------------------------
export const createBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateBrandInput) => {
    if (!input?.name || String(input.name).trim().length < 2) {
      throw new Error("Brand name is required.");
    }
    return input;
  })
  .handler(async ({ data, context }): Promise<BrandRow> => {
    const { supabase, userId } = context;

    const { count, error: countErr } = await supabase
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", userId);
    if (countErr) throw new Error(countErr.message);
    const isFirst = (count ?? 0) === 0;
    const shouldActivate = data.set_active === true || isFirst;

    if (shouldActivate) {
      const { error: deactErr } = await supabase
        .from("brands")
        .update({ is_active: false })
        .eq("partner_id", userId)
        .eq("is_active", true);
      if (deactErr) throw new Error(deactErr.message);
    }

    const insertRow = {
      partner_id: userId,
      name: s(data.name, 200)!,
      brand_type: s(data.brand_type, 60) ?? "formation",
      meaning_en: s(data.meaning_en, 600),
      meaning_ur: s(data.meaning_ur, 600),
      theme: s(data.theme, 40) ?? "blue",
      logo_prompt: s(data.logo_prompt, 4000),
      logo_url: s(data.logo_url, 1000),
      facebook_handle: s(data.facebook_handle, 200),
      instagram_handle: s(data.instagram_handle, 200),
      tagline: s(data.tagline, 300),
      is_active: shouldActivate,
    };

    const { data: row, error } = await supabase
      .from("brands")
      .insert(insertRow)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (shouldActivate) {
      await syncProfileFromBrand(supabase, userId, row as BrandRow, {
        primary: s(data.theme_primary, 20),
        secondary: s(data.theme_secondary, 20),
      });
    }

    return row as BrandRow;
  });

// ---------------------------------------------------------------------------
// deleteBrand
// ---------------------------------------------------------------------------
export const deleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Brand id is required.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", data.id)
      .eq("partner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// setActiveBrand — flips is_active and mirrors identity into the profile.
// ---------------------------------------------------------------------------
export const setActiveBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; theme_primary?: string; theme_secondary?: string }) => {
    if (!input?.id) throw new Error("Brand id is required.");
    return input;
  })
  .handler(async ({ data, context }): Promise<BrandRow> => {
    const { supabase, userId } = context;

    // Deactivate any currently-active brand for this partner.
    const { error: deactErr } = await supabase
      .from("brands")
      .update({ is_active: false })
      .eq("partner_id", userId)
      .eq("is_active", true);
    if (deactErr) throw new Error(deactErr.message);

    const { data: row, error } = await supabase
      .from("brands")
      .update({ is_active: true })
      .eq("id", data.id)
      .eq("partner_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await syncProfileFromBrand(supabase, userId, row as BrandRow, {
      primary: s(data.theme_primary, 20),
      secondary: s(data.theme_secondary, 20),
    });

    return row as BrandRow;
  });

// ---------------------------------------------------------------------------
// Helper — mirror the active brand into public.profiles.
// ---------------------------------------------------------------------------
async function syncProfileFromBrand(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  brand: BrandRow,
  colors: { primary: string | null; secondary: string | null },
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("social_links")
    .eq("id", userId)
    .maybeSingle();

  const existingSocial =
    (profile?.social_links as Record<string, string> | null) ?? {};
  const social_links: Record<string, string> = { ...existingSocial };
  if (brand.facebook_handle) social_links.facebook = brand.facebook_handle;
  if (brand.instagram_handle) social_links.instagram = brand.instagram_handle;

  const update: Record<string, unknown> = {
    brand_name: brand.name,
    social_links,
  };
  if (brand.logo_url) update.logo_url = brand.logo_url;
  if (colors.primary) update.primary_color = colors.primary;
  if (colors.secondary) update.secondary_color = colors.secondary;

  const { error } = await supabase.from("profiles").update(update).eq("id", userId);
  if (error) {
    console.warn("[brands] profile sync failed:", error.message);
  }
}
