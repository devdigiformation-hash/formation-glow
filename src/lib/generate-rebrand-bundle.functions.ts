// =============================================================================
// Lightweight Rebrand Bundle generator — marketing copy + master prompt ONLY.
// No image generation (the partner runs the image step in an external AI tool).
// =============================================================================
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { recordAiUsage, enforceQuota } from "./ai-access.server";
import { buildServiceContext, findServiceByName } from "./digiformation-knowledge";
import { buildStyleReferenceBlock, stripDigiFormationContact } from "./knowledge/caption-style";
import { buildMasterPrompt } from "./rebrand-master-prompt";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

type Brand = {
  brandName: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  primary?: string;
  secondary?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

type Input = {
  brand: Brand;
  sourceImageUrl?: string;
  serviceName?: string;
  serviceCategory?: string;
  serviceSlug?: string;
  creativeTitle?: string;
  creativeTagline?: string;
  masterMessage?: string;
};

export const generateRebrandBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as Partial<Input>;
    if (!i || typeof i !== "object") throw new Error("Invalid input");
    if (!i.brand?.brandName) throw new Error("Missing brand name");
    return i as Input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    await enforceQuota(supabase, userId, "smart_rebrand");

    const brand = data.brand;
    const matched =
      findServiceByName(data.serviceName) ?? findServiceByName(data.serviceCategory);
    const serviceCtx = buildServiceContext(data.serviceName, data.serviceCategory);
    const styleBlock = buildStyleReferenceBlock(data.serviceSlug);

    const system = `You are the DigiFormation marketing copywriter writing for a PARTNER who resells DigiFormation services under their OWN brand "${brand.brandName}".

STRICT:
- Replace any "DigiFormation" reference with the PARTNER brand "${brand.brandName}" wherever it appears as the seller.
- All contact details (WhatsApp / Email / Website) MUST be the PARTNER's.
- NEVER include "DigiFormation", "digiformation.uk", "info@digiformation.uk", or any DigiFormation phone number.

${styleBlock}

${serviceCtx}

Rules:
- SEO title + hashtags MUST use service-specific keywords.
- Never invent prices. If a price is missing, write: "Contact ${brand.brandName} for pricing".
- Respond with ONLY a valid JSON object, no markdown.${matched ? `\n- Matched DigiFormation service: ${matched.name}.` : ""}`;

    const user = `Rewrite the master marketing message for partner "${brand.brandName}".

Partner brand: ${brand.brandName}
Partner website: ${brand.website || "(none)"}
Partner WhatsApp: ${brand.whatsapp || "(none)"}
Partner email: ${brand.email || "(none)"}
Service: ${data.serviceName || data.serviceCategory || "Business services"}

ORIGINAL MESSAGE:
"""
${data.masterMessage || `${data.creativeTitle || ""} — ${data.creativeTagline || ""}`}
"""

Return JSON with EXACT keys:
{
  "title": "SEO title under 60 chars",
  "headline": "Bold italic Unicode headline + 1-2 emoji",
  "cta": "Short strong CTA (max 8 words)",
  "caption": "Full rewritten 8-block caption: headline, hook ✅, 'At ${brand.brandName}, we help…', '✅ 𝑾𝒉𝒂𝒕 𝑾𝒆 𝑯𝒆𝒍𝒑 𝒀𝒐𝒖 𝑼𝒏𝒍𝒐𝒄𝒌:' header, exactly 3 '✔️ Title: detail' bullets, CTA 🚀, partner contact (📧 / 🌐 / 📲). 600-900 chars.",
  "description": "140-160 char SEO description, no hashtags",
  "hashtags": ["6-10 SEO hashtags starting with #"]
}`;

    try {
      const res = await fetch(`${GATEWAY}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
        if (res.status === 402) throw new Error("AI credits exhausted.");
        throw new Error(`Marketing copy failed (${res.status}): ${text.slice(0, 240)}`);
      }
      const j = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
      const content = j.choices?.[0]?.message?.content ?? "{}";
      const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as {
        title?: string; headline?: string; cta?: string;
        caption?: string; description?: string; hashtags?: string[];
      };
      const scrub = (s: string) => stripDigiFormationContact(s ?? "");
      const marketing = {
        title: scrub(parsed.title ?? ""),
        headline: scrub(parsed.headline ?? ""),
        cta: scrub(parsed.cta ?? ""),
        caption: scrub(parsed.caption ?? ""),
        description: scrub(parsed.description ?? ""),
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      };

      const external_prompt = buildMasterPrompt({
        partner: {
          brandName: brand.brandName,
          email: brand.email,
          website: brand.website,
          whatsapp: brand.whatsapp,
          primary: brand.primary,
          secondary: brand.secondary,
          facebook: brand.facebook,
          instagram: brand.instagram,
          linkedin: brand.linkedin,
        },
        serviceName: data.serviceName,
        serviceSlug: data.serviceSlug,
        captionSummary: marketing.headline || marketing.title,
        cta: marketing.cta,
        referenceCreativeUrl: data.sourceImageUrl,
      });

      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: "lovable_gateway",
        model: "gemini-2.5-flash",
        success: true,
      });

      return { ...marketing, external_prompt };
    } catch (e) {
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: "lovable_gateway",
        model: "gemini-2.5-flash",
        success: false,
        errorMessage: e instanceof Error ? e.message.slice(0, 200) : "error",
      });
      throw e;
    }
  });
