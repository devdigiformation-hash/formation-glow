import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { recordAiUsage, enforceQuota } from "./ai-access.server";
import { buildServiceContext, findServiceByName } from "./digiformation-knowledge";
import { buildRebrandContext } from "./knowledge";
import { buildRebrandPrompt } from "./knowledge/serialize";
import {
  buildStyleReferenceBlock,
  stripDigiFormationContact,
} from "./knowledge/caption-style";
import { buildMasterPrompt } from "./rebrand-master-prompt";

// =============================================================================
// AI Smart Rebrand — server-side image edit + marketing content generation.
//
// Pipeline (single server call):
//   1. Gemini 3.1 Flash Image Preview re-renders the creative with partner
//      branding, removing the original logo / contact details and replacing
//      them with the partner's. Background is intelligently enhanced for the
//      service category.
//   2. Gemini 2.5 Flash drafts SEO title / caption / description / hashtags.
//
// Returns:
//   { b64_json, title, caption, description, hashtags }
// =============================================================================

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

type Brand = {
  brandName: string;
  logoDataUrl?: string | null;
  whatsapp?: string;
  email?: string;
  website?: string;
  primary?: string;
  secondary?: string;
};

type Input = {
  sourceImageUrl: string;          // http(s) or data:image/...
  logoDataUrl?: string | null;     // partner logo as data:image/...
  brand: Brand;
  serviceName?: string;
  serviceCategory?: string;
  serviceSlug?: string;            // preferred — used for DB-driven context
  creativeTitle?: string;
  creativeTagline?: string;
  masterMessage?: string;          // original master marketing message
};

function categoryVisualHint(cat?: string, service?: string): string {
  const c = `${cat || ""} ${service || ""}`.toLowerCase();
  if (c.includes("formation") || c.includes("company") || c.includes("incorporat"))
    return "Premium UK business backdrop — London skyline silhouettes (Big Ben, The Shard, Gherkin), soft corporate lighting, glass office tones. Suggests trust, credibility and Companies House professionalism.";
  if (c.includes("payment") || c.includes("merchant") || c.includes("gateway") || c.includes("pos"))
    return "Modern global fintech backdrop — abstract payment network lines, contactless / card / mobile-pay glyphs, soft neon gradients, world-map data flows. Premium fintech feel.";
  if (c.includes("bank") || c.includes("account"))
    return "Premium business banking backdrop — sleek cards, secure vault tones, IBAN/SWIFT data motifs, professional navy/teal palette.";
  if (c.includes("complian") || c.includes("vat") || c.includes("tax") || c.includes("hmrc"))
    return "Trust & compliance backdrop — clean documents, shields, governance icons, calm professional palette.";
  if (c.includes("digital") || c.includes("market") || c.includes("seo") || c.includes("social"))
    return "Modern digital marketing backdrop — devices, growth charts, glowing tech accents, vibrant gradients.";
  if (c.includes("web") || c.includes("site"))
    return "Sleek web design backdrop — browser frames, UI mockups, soft gradient mesh.";
  return "Premium professional business backdrop — modern corporate, clean composition, subtle depth.";
}

async function fetchAsDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch source image (${res.status})`);
  const buf = await res.arrayBuffer();
  const mime = res.headers.get("content-type") || "image/png";
  const b64 = Buffer.from(buf).toString("base64");
  return `data:${mime};base64,${b64}`;
}

async function callImageEdit(opts: {
  key: string;
  prompt: string;
  images: string[]; // data URLs
}): Promise<string> {
  const userContent: Array<Record<string, unknown>> = [{ type: "text", text: opts.prompt }];
  for (const img of opts.images) {
    userContent.push({ type: "image_url", image_url: { url: img } });
  }
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      messages: [{ role: "user", content: userContent }],
      modalities: ["image", "text"],
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`Image edit failed (${res.status}): ${text.slice(0, 240)}`);
  }
  let json: unknown;
  try { json = JSON.parse(text); } catch { throw new Error("Bad image response"); }
  const j = json as {
    choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
  };
  const url = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("No image returned from AI");
  // url is data:image/png;base64,XXXX
  const comma = url.indexOf(",");
  return comma >= 0 ? url.slice(comma + 1) : url;
}

async function callMarketing(opts: {
  key: string;
  brand: Brand;
  serviceName?: string;
  serviceCategory?: string;
  serviceSlug?: string;
  creativeTitle?: string;
  creativeTagline?: string;
  masterMessage?: string;
  dbContextBlock?: string;
}): Promise<{
  title: string;
  headline: string;
  cta: string;
  caption: string;
  description: string;
  hashtags: string[];
}> {
  const matched = findServiceByName(opts.serviceName) ?? findServiceByName(opts.serviceCategory);
  const serviceCtx = opts.dbContextBlock || buildServiceContext(opts.serviceName, opts.serviceCategory);
  const styleBlock = buildStyleReferenceBlock(opts.serviceSlug);
  const system =
    `You are the in-house DigiFormation marketing copywriter writing for a PARTNER who resells DigiFormation services under their own brand. You are given the ORIGINAL master marketing message for the creative and must REWRITE it so:
- The partner brand name replaces "DigiFormation" wherever it appears as the seller / contact.
- All contact details (WhatsApp / Email / Website) are replaced with the partner's contact details.
- NEVER include "DigiFormation", "digiformation.uk", info@digiformation.uk, or +92 316 4467464 anywhere in the output.
- The original marketing intent, hero message, service positioning and tone are PRESERVED.

${styleBlock}

${serviceCtx}

Rules:
- SEO title and hashtags MUST use the service-specific keywords above.
- CTA MUST match one of the suggested CTAs for this service.
- Never invent prices or B2B rates. If a price is missing, write exactly: "Contact DigiFormation for pricing".
- Respond with ONLY a valid JSON object, no markdown fences.${matched ? `\n- Matched DigiFormation service: ${matched.name}.` : ""}`;
  const user = `Rewrite the original master marketing message for this partner.

Partner brand: ${opts.brand.brandName}
Partner website: ${opts.brand.website || "(none)"}
Partner WhatsApp: ${opts.brand.whatsapp || "(none)"}
Partner email: ${opts.brand.email || "(none)"}
Service: ${opts.serviceName || opts.serviceCategory || "Business services"}
Category: ${opts.serviceCategory || "General"}

ORIGINAL MASTER MESSAGE:
"""
${opts.masterMessage || `${opts.creativeTitle || ""} — ${opts.creativeTagline || ""}`}
"""

Return JSON with these exact keys:
{
  "title": "SEO title under 60 chars (plain text, no Unicode bold)",
  "headline": "Bold italic Unicode headline using mathematical bold italic A-Z / a-z (e.g. '𝑺𝒆𝒕 𝑼𝒑 𝒀𝒐𝒖𝒓 𝑷𝒂𝒚𝒐𝒏𝒆𝒆𝒓 𝑨𝒄𝒄𝒐𝒖𝒏𝒕'), followed by 1-2 relevant emoji (🌍 💼 🚀 ✨ 💳 🇬🇧).",
  "cta": "Short strong CTA line (max 8 words). No emoji — the renderer adds 🚀.",
  "caption": "Full rewritten marketing caption following the 8-block DigiFormation style: bold italic headline, short hook line ending with ✅, brand intro line 'At [Partner Brand], we help…', '✅ 𝑾𝒉𝒂𝒕 𝑾𝒆 𝑯𝒆𝒍𝒑 𝒀𝒐𝒖 𝑼𝒏𝒍𝒐𝒄𝒌:' header, exactly 3 '✔️ Title: detail' bullets, strong CTA line ending with 🚀, partner contact lines (📧 / 🌐 / 📲) one per line — partner only. Blank line between sections. 600-900 chars.",
  "description": "SEO marketing description, 140-160 chars, no hashtags",
  "hashtags": ["6-10 SEO hashtags, each starting with #, service-specific, include a partner brand hashtag when sensible, rotate naturally"]
}`;

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.key}`,
      "Content-Type": "application/json",
    },
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
    title?: string;
    headline?: string;
    cta?: string;
    caption?: string;
    description?: string;
    hashtags?: string[];
  };
  // Post-process: strip any DigiFormation contact leakage in text fields.
  const scrub = (s: string) => stripDigiFormationContact(s ?? "");
  return {
    title: scrub(parsed.title ?? ""),
    headline: scrub(parsed.headline ?? ""),
    cta: scrub(parsed.cta ?? ""),
    caption: scrub(parsed.caption ?? ""),
    description: scrub(parsed.description ?? ""),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
  };
}


export const aiSmartRebrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as Partial<Input>;
    if (!i || typeof i !== "object") throw new Error("Invalid input");
    if (!i.sourceImageUrl) throw new Error("Missing source image");
    if (!i.brand?.brandName) throw new Error("Missing brand name");
    return i as Input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    // Per-day quota: free=3, premium=20, admin=unlimited.
    await enforceQuota(supabase, userId, "smart_rebrand");


    const sourceData = await fetchAsDataUrl(data.sourceImageUrl);
    const images = [sourceData];
    if (data.logoDataUrl && data.logoDataUrl.startsWith("data:")) {
      images.push(data.logoDataUrl);
    }

    const brand = data.brand;
    const contact = [
      brand.website && `Website: ${brand.website}`,
      brand.whatsapp && `WhatsApp: ${brand.whatsapp}`,
      brand.email && `Email: ${brand.email}`,
    ].filter(Boolean).join("  •  ");

    const visualHint = categoryVisualHint(data.serviceCategory, data.serviceName);
    const colors = `Primary brand color ${brand.primary || "#22d3ee"}, secondary ${brand.secondary || "#a78bfa"}.`;
    const logoNote = images.length > 1
      ? "The SECOND image is the partner logo. Treat it as a logo asset: detect and REMOVE any background/box around it, convert to a clean transparent placement, resize proportionally, and position it professionally in the header (top-left or top-center). Never paste it as a raw square or with its original background."
      : `No logo image provided — render the brand name "${brand.brandName}" as a clean modern wordmark in the header (custom typography, well-kerned).`;

    const prompt = `You are a senior marketing designer and brand specialist. Rebrand the FIRST image into a polished, professional, social-media-ready creative for the brand "${brand.brandName}".

STRICT RULES:
- Remove ALL original branding from the source: original logo(s), watermarks, original brand name, and any URL / phone / email / handle belonging to the previous brand. Do not leave ghosting or artifacts.
- Replace the contact strip (typically at the bottom) with EXACTLY this contact info, cleanly typeset on a single readable strip: ${contact || "(no contact info — omit the strip cleanly, do not invent placeholders)"}
- Apply the partner brand. ${colors}
- ${logoNote}
- Re-theme the background tastefully and intelligently for the service: ${visualHint}
- Improve composition, spacing, typography hierarchy, color harmony, contrast and CTA placement. Output must look like a human senior designer crafted it — not a template.
- PRESERVE the original marketing intent, hero headline and core message of the source creative.
- Output ONE finished 1080x1080 SQUARE image (Facebook / Instagram feed ready). Keep all critical elements (logo, headline, CTA, contact strip) at least 60px away from every edge so nothing is cropped. No frames, no captions, no text outside the image.`;

    // Pull DB-driven context (safe fallback to legacy on failure).
    let dbContextBlock: string | undefined;
    try {
      const ctx = await buildRebrandContext({
        serviceSlug: data.serviceSlug,
        partnerId: userId,
        client: supabase,
      });
      dbContextBlock = buildRebrandPrompt(ctx);
    } catch (err) {
      console.warn("[ai-rebrand] knowledge context failed, using legacy block", err);
    }

    try {
      const [b64_json, marketing] = await Promise.all([
        callImageEdit({ key, prompt, images }),
        callMarketing({
          key,
          brand,
          serviceName: data.serviceName,
          serviceCategory: data.serviceCategory,
          serviceSlug: data.serviceSlug,
          creativeTitle: data.creativeTitle,
          creativeTagline: data.creativeTagline,
          masterMessage: data.masterMessage,
          dbContextBlock,
        }),
      ]);
      // External-AI master prompt — composed from the partner profile and the
      // freshly generated headline/CTA so the partner can paste it straight
      // into ChatGPT / Gemini / Lovable / Ideogram.
      const external_prompt = buildMasterPrompt({
        partner: {
          brandName: brand.brandName,
          email: brand.email,
          website: brand.website,
          whatsapp: brand.whatsapp,
          primary: brand.primary,
          secondary: brand.secondary,
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
        model: "gemini-image-edit+gemini-2.5-flash",
        success: true,
      });
      return { b64_json, ...marketing, external_prompt };

    } catch (e) {
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: "lovable_gateway",
        model: "gemini-image-edit+gemini-2.5-flash",
        success: false,
        errorMessage: e instanceof Error ? e.message.slice(0, 200) : "error",
      });
      throw e;
    }
  });
