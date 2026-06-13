// =============================================================================
// External AI Prompt Engine
// -----------------------------------------------------------------------------
// Pure client-side prompt builders. No server calls, no credits.
// Composes the partner profile + DigiFormation knowledge into ready-made
// prompts the affiliate can paste into ChatGPT / Gemini / Lovable / Ideogram.
// =============================================================================

import { buildServiceContext, findServiceByName, DIGIFORMATION_BRAND } from "./digiformation-knowledge";

export type PromptBrand = {
  brandName: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  primary?: string;
  secondary?: string;
  logoDataUrl?: string | null;
  social?: Record<string, string | undefined>;
};

export type PromptInput = {
  brand: PromptBrand;
  serviceName?: string;
  serviceCategory?: string;
  serviceSlug?: string;
  creativeTitle?: string;
  creativeTagline?: string;
  masterMessage?: string;
  /** Pre-built DigiFormation knowledge block injected by the host component
   *  (sourced from buildExternalPromptContext + buildExternalPromptBlock).
   *  When present, overrides the legacy hardcoded buildServiceContext output. */
  dbContextBlock?: string;
};

export type ExternalTool = "chatgpt" | "gemini" | "lovable" | "ideogram";

export const EXTERNAL_TOOLS: {
  id: ExternalTool;
  label: string;
  url: string;
  bestFor: string;
  note: string;
}[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    url: "https://chat.openai.com/",
    bestFor: "Conversational rebriefs, ad variations, and long-form posts. Image with GPT-Image when on Plus.",
    note: "Uses your own free or Plus account.",
  },
  {
    id: "gemini",
    label: "Gemini",
    url: "https://gemini.google.com/app",
    bestFor: "Free image generation (Imagen / Nano Banana) and instant content drafts.",
    note: "Uses your own free Google account.",
  },
  {
    id: "lovable",
    label: "Lovable",
    url: "https://lovable.dev/",
    bestFor: "Generating branded landing pages, microsites and shareable funnels.",
    note: "Uses your own Lovable account.",
  },
  {
    id: "ideogram",
    label: "Ideogram",
    url: "https://ideogram.ai/",
    bestFor: "Typography-first creatives — headlines, badges, social posters with readable text.",
    note: "Uses your own free Ideogram account.",
  },
];

function contactBlock(b: PromptBrand): string {
  return [
    b.website && `Website: ${b.website}`,
    b.whatsapp && `WhatsApp: ${b.whatsapp}`,
    b.email && `Email: ${b.email}`,
  ].filter(Boolean).join("\n");
}

function brandBlock(b: PromptBrand): string {
  return [
    `Brand name: ${b.brandName}`,
    b.primary && `Primary color: ${b.primary}`,
    b.secondary && `Secondary color: ${b.secondary}`,
    b.logoDataUrl ? `Logo: provided (attach the brand logo when generating)` : `Logo: render brand name "${b.brandName}" as a clean modern wordmark`,
  ].filter(Boolean).join("\n");
}

function serviceBlock(input: PromptInput): string {
  // Prefer the DB-driven knowledge block when the host injects it; fall back
  // to the legacy hardcoded buildServiceContext otherwise.
  const ctx = input.dbContextBlock || buildServiceContext(input.serviceName, input.serviceCategory);
  const matched = findServiceByName(input.serviceName) ?? findServiceByName(input.serviceCategory);
  return [
    ctx,
    input.creativeTitle && `Creative title: ${input.creativeTitle}`,
    input.creativeTagline && `Tagline: ${input.creativeTagline}`,
    input.masterMessage && `Original master message:\n"""${input.masterMessage}"""`,
    matched ? `CTA options: ${matched.ctas.join(" | ")}` : "",
  ].filter(Boolean).join("\n");
}

const SHARED_TASK_RULES = `SHARED RULES (apply to every output):
- Output a single 1080×1080 square image (Facebook / Instagram feed ready).
- Remove ALL DigiFormation branding from the source and replace with the partner brand and contact info above.
- Caption MUST be SEO-friendly using the keywords listed in the SERVICE block.
- Always include 15-22 hashtags (mix of industry / reach / niche).
- Publishing intent: ready to post to Facebook + Instagram feed without further editing.
- Never invent prices. If a price is missing, write exactly: "Contact DigiFormation for pricing".`;

function basePrompt(input: PromptInput): string {
  return `You are creating a social media creative for a partner of ${DIGIFORMATION_BRAND.shortName} (${DIGIFORMATION_BRAND.legalName}). Tone: ${DIGIFORMATION_BRAND.toneOfVoice}.

=== PARTNER BRAND ===
${brandBlock(input.brand)}

=== PARTNER CONTACT (must appear on the creative — no other contact info) ===
${contactBlock(input.brand) || "(no contact info provided)"}

=== SERVICE BEING PROMOTED ===
${serviceBlock(input)}`;
}

export function buildPromptFor(tool: ExternalTool, input: PromptInput): string {
  const base = basePrompt(input);
  switch (tool) {
    case "chatgpt":
      return `${base}

=== TASK ===
Generate a polished 1080×1080 square social media creative ready for Facebook and Instagram.
- Remove ALL DigiFormation branding from the source. Show ONLY the partner brand above.
- Headline (bold, large), short benefit subline, strong CTA, and the partner contact strip at the bottom.
- Modern professional layout. Keep 60px safe margin from every edge.
Also output below the image:
1. SEO title (<60 chars)
2. SEO caption (600-900 chars) ending with the partner contact lines, written using the SEO keywords above
3. SEO description (140-160 chars)
4. 15-22 hashtags

${SHARED_TASK_RULES}`;

    case "gemini":
      return `${base}

=== TASK FOR GEMINI / NANO BANANA / IMAGEN ===
Create a single 1:1 (1080x1080) premium marketing image:
- Subject: the service above, themed for the partner brand colors.
- Show partner brand name prominently. Include the contact strip at the bottom.
- No other brand names, logos, watermarks or URLs.
- Clean typography, high contrast, social-feed ready.

After the image, write: SEO title, SEO caption (with partner contacts on separate lines and emojis 🌐 📱 ✉️), SEO description, and 18 hashtags.

${SHARED_TASK_RULES}`;

    case "lovable":
      return `${base}

=== TASK FOR LOVABLE ===
Build a one-page landing page / microsite for the service above, branded for the partner.
- Hero with headline, sub-headline, primary CTA (WhatsApp link if provided).
- Benefits section (3-4 cards) reflecting the service benefits above.
- Trust strip referencing: ${DIGIFORMATION_BRAND.proof.slice(0, 3).join(" • ")}.
- Sticky contact bar with the partner contact info.
- Use the partner primary/secondary colors as the theme accents.
- Mobile-first, fast, accessible. No mention of DigiFormation as the seller — the partner is the seller.

${SHARED_TASK_RULES}`;

    case "ideogram":
      return `${base}

=== TASK FOR IDEOGRAM ===
Generate a 1:1 typography-led 1080×1080 social poster:
- Hero text (large, perfectly legible): rewrite the original master message into a 5-9 word benefit headline.
- Sub-headline: one-line value prop tied to the service.
- Partner brand name visible as a clean wordmark in the header.
- Partner contact strip at the bottom (small but readable): ${contactBlock(input.brand).replace(/\n/g, " · ") || "(omit if none)"}
- Style: premium modern, brand colors ${input.brand.primary || "#22d3ee"} → ${input.brand.secondary || "#a78bfa"}, soft gradient background, professional fintech / business vibe.
- Absolutely no other brand names, logos or URLs.

${SHARED_TASK_RULES}`;
  }
}

// ─── Distribution helpers ──────────────────────────────────────────────────
export const PLATFORMS: {
  id: "facebook" | "instagram" | "linkedin" | "pinterest";
  label: string;
  imageSize: string;
  captionTip: string;
  hashtagTip: string;
  shareUrl: (text: string, url?: string) => string | null;
}[] = [
  {
    id: "facebook",
    label: "Facebook",
    imageSize: "1080×1080 (feed) or 1080×1350",
    captionTip: "200-500 chars perform best.",
    hashtagTip: "2-5 hashtags. Avoid hashtag walls.",
    shareUrl: (_t, u) => (u ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` : null),
  },
  {
    id: "instagram",
    label: "Instagram",
    imageSize: "1080×1080 (feed) or 1080×1920 (story/reel)",
    captionTip: "First 125 chars show in feed. Hook fast.",
    hashtagTip: "15-22 hashtags, mix niche + broad.",
    shareUrl: () => null, // Instagram has no web share intent — manual upload
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    imageSize: "1200×1200 or 1200×627",
    captionTip: "150-300 word post performs best. Add a hook line + line breaks.",
    hashtagTip: "3-5 professional hashtags.",
    shareUrl: (_t, u) => (u ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` : null),
  },
  {
    id: "pinterest",
    label: "Pinterest",
    imageSize: "1000×1500 (2:3) vertical",
    captionTip: "Keyword-rich description. 100-500 chars.",
    hashtagTip: "3-5 hashtags max.",
    shareUrl: (t, u) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u || "")}&description=${encodeURIComponent(t)}`,
  },
];
