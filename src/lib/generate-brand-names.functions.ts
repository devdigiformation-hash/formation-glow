import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforceQuota, recordAiUsage } from "./ai-access.server";

// ---------------------------------------------------------------------------
// Supported languages for brand-meaning localization.
// Brand NAMES are always English. Only the short brand-impression sentence
// ("meaning") is localized.
// ---------------------------------------------------------------------------
export const SUPPORTED_BRAND_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ur", label: "Urdu", native: "اردو" },
] as const;
export type BrandLanguage = (typeof SUPPORTED_BRAND_LANGUAGES)[number]["code"];

const LANGUAGE_INSTRUCTIONS: Record<BrandLanguage, string> = {
  en: `Write the meaning in natural, professional English. One short sentence (max 18 words). Describe the brand impression / personality (modern, trustworthy, international, premium, fintech-friendly, etc). It is NOT a dictionary translation of the made-up word.`,
  ur: `Write the meaning in natural, professional Urdu using proper Urdu script (نستعلیق). One short sentence. Describe the brand impression / personality (جدید، قابل اعتماد، بین الاقوامی، پریمیم، فِن ٹیک دوست وغیرہ). It is NOT a dictionary translation of the made-up word. Do NOT transliterate.`,
};

function buildSystemPrompt(category: string) {
  return `You are a senior brand naming strategist for premium company-formation, fintech, banking, and corporate-services brands (think PayPal, Wise, Stripe, Payoneer, Airwallex, Osome, Tide, 1stFormations).

Your job: generate brand names for a partner who promotes COMPANY FORMATION services (UK Ltd, US LLC, offshore formations) alongside banking, payments and ecommerce.

STRICT NAME RULES — READ CAREFULLY:
- Each output name MUST follow this EXACT shape: "<Invented Word> ${category}".
- The category word "${category}" MUST appear at the end of EVERY name, spelled exactly as given.
- The "<Invented Word>" is ONE invented, brandable English word (2 to 4 syllables, 5 to 12 characters, easy to pronounce). NOT a real dictionary word, NOT a real existing company.
- Do NOT output single-word names like "Validation Ltd", "Vision Ltd", "Growth Ltd", "Success Ltd". Those are invalid.
- Do NOT append Ltd / Limited / Inc / Corp / Group / Capital / Partners / Global / LLC. The ONLY trailing word allowed is "${category}".
- Names must feel: professional, corporate, trustworthy, international, banking-friendly, fintech-friendly, formation-friendly, modern, premium.

CORRECT examples for category "${category}":
- Takova ${category}
- Altrivo ${category}
- Nexora ${category}
- Quintara ${category}
- Formexa ${category}

FORBIDDEN — never use, never combine, never base names on:
Nova, Prime, Vertex, Core, Orbit, Peak, Axis, Bridge, Flow, Nexus, Apex, Aero, Vento, Lumen, Zen, Zenith, Pulse, Spark, Cloud, Sky, Hub, Stack, Forge, Loop, Wave, Echo, Pixel, Byte, Logic, Velocity, Quantum, Strato.

Also avoid anything resembling: PayPal, Wise, Stripe, Payoneer, Revolut, Monzo, Starling, Airwallex, Chase, HSBC, Barclays, Lloyds, Mercury, Brex, Ramp, Square, Klarna, Plaid, Coinbase, Binance, OnlyDomains, Tide, Osome, 1stFormations.

Every time you are called you MUST produce a completely fresh, different list. Do not repeat names from previous calls.

OUTPUT FORMAT:
Output ONLY a JSON object of the form:
{ "items": [ { "name": "Invented ${category}", "meaning": "..." }, ... ] }
No markdown, no commentary, no code fences, no extra keys.`;
}

const MEANINGS_ONLY_SYSTEM_PROMPT = `You are a brand strategist. You will be given a list of premium fintech / corporate brand names.

For each name, write ONE short brand-impression sentence describing the brand personality (modern, trustworthy, international, premium, banking-friendly, fintech-friendly). It must NOT be a dictionary translation of the invented word — it describes the FEEL of the brand.

OUTPUT FORMAT:
Output ONLY a JSON object:
{ "items": [ { "name": "<exact input name>", "meaning": "..." }, ... ] }
Preserve the input order and the exact input name string. No markdown, no commentary.`;

type Item = { name: string; meaning: string };

function normalizeLanguage(input: unknown): BrandLanguage {
  const v = String(input ?? "").toLowerCase().slice(0, 2);
  return SUPPORTED_BRAND_LANGUAGES.some((l) => l.code === v) ? (v as BrandLanguage) : "en";
}

const ALLOWED_CATEGORIES = ["Formation", "Solutions", "Services", "Consulting"] as const;
type Category = (typeof ALLOWED_CATEGORIES)[number];
function normalizeCategory(input: unknown): Category {
  const v = String(input ?? "").trim().toLowerCase();
  const match = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === v || `${c.toLowerCase()}s` === v);
  return (match ?? "Formation");
}

async function callGateway(systemPrompt: string, userMsg: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 1.0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
    const text = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseItems(raw: string): Item[] {
  try {
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed?.items) ? parsed.items : [];
    return arr
      .map((it: { name?: unknown; meaning?: unknown }) => ({
        name: String(it?.name ?? "").trim(),
        meaning: String(it?.meaning ?? "").trim(),
      }))
      .filter((it: Item) => it.name.length > 0);
  } catch {
    return [];
  }
}

// Force the chosen category as the trailing word of the brand name.
function enforceCategory(name: string, category: Category): string {
  let cleaned = name.replace(/["'`]/g, "").trim();
  // strip company endings
  cleaned = cleaned.replace(/\s+(Ltd|Limited|Inc|Corp|Group|Capital|Partners|Global|LLC)\.?$/i, "").trim();
  // strip any trailing category variant
  cleaned = cleaned.replace(/\s+(Formations?|Solutions?|Services?|Consulting)\b\.?$/i, "").trim();
  if (!cleaned) return "";
  // reject single-word generic outputs (no invented root)
  return `${cleaned} ${category}`;
}

// ---------------------------------------------------------------------------
// generateBrandNames — produces 10 fresh names + localized meanings.
// ---------------------------------------------------------------------------
export const generateBrandNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { niche?: string; serviceType?: string; seed?: string; language?: string }) => ({
    niche: (input?.niche ?? "").toString().slice(0, 200).trim(),
    serviceType: (input?.serviceType ?? "").toString().slice(0, 200).trim(),
    seed: (input?.seed ?? "").toString().slice(0, 64).trim(),
    language: normalizeLanguage(input?.language),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await enforceQuota(supabase, userId, "smart_agent");

    const category = normalizeCategory(data.serviceType);
    const systemPrompt = `${buildSystemPrompt(category)}\n\nMEANING LANGUAGE: ${data.language}\n${LANGUAGE_INSTRUCTIONS[data.language]}`;

    const userMsg = [
      data.niche ? `Business niche: ${data.niche}` : "",
      `Selected category (MUST end every name): ${category}`,
      `Variation seed (use for freshness, do not include in names): ${data.seed || crypto.randomUUID()}`,
      `Generate EXACTLY 10 fresh items. Each name MUST be "<Invented Word> ${category}" (English). meaning in ${data.language}. JSON only.`,
    ].filter(Boolean).join("\n");

    let raw = "";
    try {
      raw = await callGateway(systemPrompt, userMsg);
    } catch (e) {
      await recordAiUsage(supabase, {
        partnerId: userId, provider: "lovable_gateway", model: "google/gemini-2.5-flash",
        success: false, errorMessage: `brand-names:${(e as Error).message}`,
      });
      throw e;
    }

    let items = parseItems(raw)
      .map((it) => ({ name: enforceCategory(it.name, category), meaning: it.meaning }))
      .filter((it) => {
        // must be at least two words: "<Invented> <Category>"
        const parts = it.name.split(/\s+/);
        return parts.length >= 2 && it.name.length > 4 && it.name.length < 60;
      })
      .slice(0, 10);

    if (items.length < 5) {
      await recordAiUsage(supabase, {
        partnerId: userId, provider: "lovable_gateway", model: "google/gemini-2.5-flash",
        success: false, errorMessage: "brand-names:unusable",
      });
      throw new Error("AI returned an unusable response. Try again.");
    }

    await recordAiUsage(supabase, {
      partnerId: userId, provider: "lovable_gateway", model: "google/gemini-2.5-flash", success: true,
    });

    return { items, language: data.language };
  });

// ---------------------------------------------------------------------------
// translateBrandMeanings — re-produces meanings in another language for an
// EXISTING list of brand names (names themselves are not regenerated).
// ---------------------------------------------------------------------------
export const translateBrandMeanings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { names?: unknown; language?: string }) => {
    const arr = Array.isArray(input?.names) ? input.names : [];
    const names = arr
      .map((n) => String(n ?? "").trim())
      .filter((n) => n.length > 0 && n.length < 60)
      .slice(0, 20);
    return { names, language: normalizeLanguage(input?.language) };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.names.length === 0) return { items: [] as Item[], language: data.language };
    await enforceQuota(supabase, userId, "smart_agent");

    const systemPrompt = `${MEANINGS_ONLY_SYSTEM_PROMPT}\n\nMEANING LANGUAGE: ${data.language}\n${LANGUAGE_INSTRUCTIONS[data.language]}`;
    const userMsg = `Names:\n${data.names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\nReturn meanings in ${data.language}. JSON only.`;

    let raw = "";
    try {
      raw = await callGateway(systemPrompt, userMsg);
    } catch (e) {
      await recordAiUsage(supabase, {
        partnerId: userId, provider: "lovable_gateway", model: "google/gemini-2.5-flash",
        success: false, errorMessage: `brand-meanings:${(e as Error).message}`,
      });
      throw e;
    }

    const parsed = parseItems(raw);
    // Align meanings to the input name order — fall back to positional match.
    const byName = new Map(parsed.map((it) => [it.name.toLowerCase(), it.meaning]));
    const items: Item[] = data.names.map((n, i) => ({
      name: n,
      meaning: byName.get(n.toLowerCase()) ?? parsed[i]?.meaning ?? "",
    }));

    await recordAiUsage(supabase, {
      partnerId: userId, provider: "lovable_gateway", model: "google/gemini-2.5-flash", success: true,
    });

    return { items, language: data.language };
  });
