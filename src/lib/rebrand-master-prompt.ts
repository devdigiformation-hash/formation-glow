// =============================================================================
// Rebrand Studio — Master Prompt builder for external AI tools
// (ChatGPT, Gemini, Lovable, Ideogram).
//
// Pure builder — no I/O. Produces the single "master prompt" that a partner
// pastes alongside a reference creative into any external AI tool. Encodes
// the 12 strict rules required by the workflow spec.
// =============================================================================

import { stripDigiFormationContact } from "./knowledge/caption-style";

export interface MasterPromptPartner {
  brandName: string;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  primary?: string | null;
  secondary?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}

export interface MasterPromptInput {
  partner: MasterPromptPartner;
  serviceName?: string;
  serviceSlug?: string;
  captionSummary?: string;
  cta?: string;
  /** Optional reference creative URL (the partner uploads it manually). */
  referenceCreativeUrl?: string;
}

function partnerContactBlock(p: MasterPromptPartner): string {
  // Contact section: ONLY website / email / whatsapp — never social URLs or usernames.
  return [
    p.website && `Website: ${p.website}`,
    p.email && `Email: ${p.email}`,
    p.whatsapp && `WhatsApp: ${p.whatsapp}`,
  ].filter(Boolean).join("\n");
}

function socialIconList(p: MasterPromptPartner): string {
  const icons = [
    p.facebook && "Facebook",
    p.instagram && "Instagram",
    p.linkedin && "LinkedIn",
  ].filter(Boolean) as string[];
  return icons.length ? icons.join(", ") : "(none)";
}

export function buildMasterPrompt(input: MasterPromptInput): string {
  const { partner, serviceName, captionSummary, cta, referenceCreativeUrl } = input;
  const contact = partnerContactBlock(partner) || "(none provided)";
  const socialIcons = socialIconList(partner);
  const summary = stripDigiFormationContact(captionSummary || "");

  return `IMPORTANT: Use MY partner brand details, NOT DigiFormation branding.

Reference Brand (in the uploaded image) = DigiFormation  (INSPIRATION ONLY — never copy, never output)
Target Brand (what you must produce) = ${partner.brandName}

=== CHAT SETUP (do this first, then never again) ===
A. If this is a fresh chat: rename this chat to "Brand Creative Generator".
B. Upload my LOGO once at the start of this chat. Keep reusing the same chat for every future creative — the AI must remember my branding, logo, contact details and visual style.
C. Do NOT start a new chat per creative unless absolutely necessary.

Use the uploaded reference creative as DESIGN INSPIRATION ONLY — do not copy it pixel-for-pixel. Keep a similar layout, structure and visual hierarchy, then redesign it professionally as a premium 1080×1080 square social-media creative for my brand (Facebook + Instagram feed ready).

=== LOCKED RULES (non-negotiable) ===

RULE 1 — LOGO IS LOCKED
- Use the EXACT uploaded partner logo as provided.
- Never redesign, recreate, recolor, crop or modify the logo.
- Never remove the logo background.
- Never replace the logo with a generated one.
- Place the original logo inside a clean WHITE rounded card (rounded corners, generous padding, soft subtle shadow). Position in the header (top-left or top-center).

RULE 2 — PARTNER CONTACT IS LOCKED
- Always use MY contact info, never DigiFormation's.
- Show ONLY these lines (each on its own line with a small icon), and ONLY if provided:
${contact}
- Never invent, swap or omit my contact details.
- Never print "DigiFormation", "digiformation.uk", "info@digiformation.uk" or any DigiFormation phone.

RULE 3 — SOCIAL ICONS ONLY
- Render small monochrome icons for: ${socialIcons}.
- DO NOT print facebook.com/..., instagram.com/..., x.com/..., linkedin.com/... URLs.
- DO NOT print @usernames, handles, or the words "Facebook", "Instagram", "LinkedIn", "X" next to the icons.
- Just the recognizable platform icons, evenly spaced, in the brand accent or white.

RULE 4 — REFERENCE vs TARGET
- Reference Brand (DigiFormation) is INSPIRATION ONLY.
- Target Brand (${partner.brandName}) is the ONLY brand shown in the output.
- Never copy DigiFormation branding. Never output the DigiFormation name, logo, URL, email or phone anywhere.

=== ADDITIONAL DESIGN RULES ===
5. BRAND COLOR — auto-detect from the uploaded logo. Build a professional, high-contrast palette. Readability always wins. Forbidden: yellow on orange, dark grey on black, pastel on pastel.
6. Redesign for a modern premium corporate / fintech / business audience.
7. Final output MUST be 1080×1080 (square).
8. All text must be fully readable — strong contrast, generous spacing, clean hierarchy.
9. Keep critical elements (logo card, headline, CTA, contact strip, social icons) at least 60px away from every edge. Do not crop them.
10. Premium typography only. No cheap fonts, no spammy gradients, no over-promising claims.
11. No watermarks, no other brand names, no extra URLs, no third-party logos.

=== CONTEXT ===
Service being promoted: ${serviceName || "(not specified)"}
Headline / main message: ${summary || "(use the reference's core message, rewritten for my brand)"}
CTA: ${cta || "(use a strong relevant CTA)"}
${referenceCreativeUrl ? `Reference image URL: ${referenceCreativeUrl}` : "Reference image: uploaded separately."}

=== PRE-OUTPUT QUALITY CHECK (verify before finalizing) ===
1. The chat is named "Brand Creative Generator" and my logo was uploaded once at the top.
2. Partner logo visible, untouched, original background intact, inside a white rounded card with soft shadow.
3. Email visible (if provided).
4. WhatsApp visible (if provided).
5. Website visible ONLY if provided.
6. NO social URLs anywhere on the image.
7. NO social usernames or handles anywhere.
8. Only social ICONS shown for the platforms listed above.
9. Brand colors derived from the logo, high-contrast, professional.
10. Text is highly readable everywhere.
11. ZERO DigiFormation branding, name, logo, URL, email or phone remains.

Output ONE finished 1080×1080 image. No frames, no extra captions, no text outside the image.`;
}

/** Step-by-step external-AI workflow shown alongside the master prompt. */
export const EXTERNAL_AI_STEPS: { step: number; title: string }[] = [
  { step: 1, title: "Download the selected DigiFormation reference creative" },
  { step: 2, title: "Copy your generated caption" },
  { step: 3, title: "Copy the master prompt" },
  { step: 4, title: "Open your selected AI tool (ChatGPT / Gemini / Lovable / Ideogram)" },
  { step: 5, title: "Log in with your own account" },
  { step: 6, title: "Create a fresh chat and rename it to \"Brand Creative Generator\"" },
  { step: 7, title: "Upload your logo ONCE in this chat (reuse it for every future creative)" },
  { step: 8, title: "Upload the reference creative" },
  { step: 9, title: "Paste the master prompt" },
  { step: 10, title: "Generate the redesigned creative" },
  { step: 11, title: "Download the final 1080×1080 image" },
  { step: 12, title: "Return to Rebrand Studio — copy caption + hashtags and publish" },
  { step: 13, title: "Keep using the SAME \"Brand Creative Generator\" chat for all future rebrands" },
];
