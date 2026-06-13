// =============================================================================
// DigiFormation Caption Style System
//
// Pure, isomorphic helpers that encode the DigiFormation house caption style:
//   - Premium bold-italic Unicode headlines
//   - 8-block caption template (Headline / Hook / Brand intro / Benefits
//     header / 3 bullets / CTA / Contact / Hashtags)
//   - Per-service style guide (angle keywords + hashtag pool)
//   - Few-shot style examples used as AI reference (internal only)
//   - Post-process sweep that strips DigiFormation contact info from partner
//     output, never the other way around
//
// All copy generation pipelines (Rebrand Studio, Marketing Pack, External AI
// deck) should feed their AI prompts through these primitives so every output
// follows the same structure regardless of who is generating it.
// =============================================================================

// ─── 1. Bold Italic Unicode ─────────────────────────────────────────────────
// Mathematical Bold Italic block:
//   A (U+1D468) … Z (U+1D481)
//   a (U+1D482) … z (U+1D49B)
// Digits / punctuation / emoji pass through unchanged. Digits do not have a
// math bold italic variant in Unicode.
const BOLD_ITALIC_UPPER_BASE = 0x1d468;
const BOLD_ITALIC_LOWER_BASE = 0x1d482;
const UPPER_A = 0x41;
const LOWER_A = 0x61;

export function toBoldItalicUnicode(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0);
    if (code === undefined) continue;
    if (code >= UPPER_A && code <= UPPER_A + 25) {
      out += String.fromCodePoint(BOLD_ITALIC_UPPER_BASE + (code - UPPER_A));
    } else if (code >= LOWER_A && code <= LOWER_A + 25) {
      out += String.fromCodePoint(BOLD_ITALIC_LOWER_BASE + (code - LOWER_A));
    } else {
      out += ch;
    }
  }
  return out;
}

// ─── 2. Caption template ────────────────────────────────────────────────────
export interface CaptionContact {
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
}

export interface CaptionBlocks {
  headline: string;           // already styled (or will be styled by assembleCaption)
  hook?: string;              // short problem/desire line
  brandIntroBrand: string;    // partner brand name
  brandIntroOutcome: string;  // service outcome ("access global payouts" etc.)
  benefits: Array<{ title: string; detail: string }>; // expect 3
  cta: string;
  contact: CaptionContact;
  hashtags: string[];
}

export const BENEFITS_HEADER = `✅ ${toBoldItalicUnicode("What We Help You Unlock")}:`;

/** Strip DigiFormation contact info from any caption fragment so it never
 *  leaks into partner output. Idempotent. */
export function stripDigiFormationContact(text: string): string {
  if (!text) return text;
  return text
    // emails
    .replace(/info@digiformation\.uk/gi, "")
    .replace(/[\w.-]+@digiformation\.[a-z.]+/gi, "")
    // websites
    .replace(/https?:\/\/(www\.)?digiformation\.[a-z.\/]+/gi, "")
    .replace(/(www\.)?digiformation\.[a-z]{2,}/gi, "")
    // Pakistan owner phone (the one shared with us)
    .replace(/\+?92\s*316\s*4467\s*464/g, "")
    // brand mentions used as the seller
    .replace(/DigiFormation\s+Ltd\.?/g, "")
    .replace(/\bDigiFormation\b/g, "")
    // tidy double spaces / empty lines left behind
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function contactLines(c: CaptionContact): string {
  return [
    c.email && `📧 Email: ${c.email}`,
    c.website && `🌐 Website: ${c.website}`,
    c.whatsapp && `📲 WhatsApp: ${c.whatsapp}`,
  ].filter(Boolean).join("\n");
}

function bulletLines(items: CaptionBlocks["benefits"]): string {
  return items.slice(0, 3).map((b) => `✔️ ${b.title}: ${b.detail}`).join("\n");
}

/** Deterministic renderer — guarantees structure even if the AI omits a block. */
export function assembleCaption(b: CaptionBlocks): string {
  const headline = /[\u{1D400}-\u{1D7FF}]/u.test(b.headline)
    ? b.headline
    : toBoldItalicUnicode(b.headline);
  const intro = `At ${b.brandIntroBrand}, we help entrepreneurs, freelancers, ecommerce sellers, and global founders ${b.brandIntroOutcome} through a safe, compliant, business-ready setup.`;
  const sections = [
    headline,
    b.hook ? `${b.hook} ✅` : "",
    intro,
    BENEFITS_HEADER,
    bulletLines(b.benefits),
    `${b.cta} 🚀`,
    contactLines(b.contact),
    b.hashtags.filter(Boolean).join(" "),
  ].filter((s) => s && s.trim().length > 0);
  return stripDigiFormationContact(sections.join("\n\n"));
}

// ─── 3. Service style guide (fallback when DB knowledge is empty) ───────────
export interface ServiceStyle {
  /** Primary angle keywords the AI should weave into the caption. */
  angles: string[];
  /** Suggested hashtag pool (the AI may rotate within and beyond this). */
  hashtagPool: string[];
}

export const SERVICE_STYLE_GUIDE: Record<string, ServiceStyle> = {
  payoneer: {
    angles: ["global receiving", "marketplace payouts", "freelancing", "Amazon", "eBay", "Fiverr", "Upwork"],
    hashtagPool: ["#PayoneerAccount", "#GlobalPayments", "#Freelancers", "#EcommerceSellers", "#OnlineBusiness"],
  },
  worldfirst: {
    angles: ["cross-border payments", "B2B trade", "FX conversion", "global marketplace revenue"],
    hashtagPool: ["#WorldFirst", "#CrossBorderPayments", "#GlobalTrade", "#FX", "#B2B"],
  },
  pingpong: {
    angles: ["Amazon payouts", "eBay payouts", "Shopify", "Stripe payouts", "low FX", "ecommerce"],
    hashtagPool: ["#PingPong", "#AmazonSellers", "#ShopifyPayouts", "#Ecommerce"],
  },
  sunrate: {
    angles: ["eBay", "Amazon", "Etsy", "stuck payouts", "B2B payments", "multi-currency"],
    hashtagPool: ["#Sunrate", "#B2BPayments", "#MultiCurrency", "#EtsySellers"],
  },
  airwallex: {
    angles: ["non-resident founders", "multi-currency", "global business payments"],
    hashtagPool: ["#Airwallex", "#GlobalBusiness", "#MultiCurrency", "#Fintech"],
  },
  wise: {
    angles: ["business banking", "multi-currency", "international transfers"],
    hashtagPool: ["#Wise", "#BusinessBanking", "#InternationalTransfers", "#MultiCurrency"],
  },
  paypal: {
    angles: ["global payments", "ecommerce", "client payments", "UK business PayPal setup"],
    hashtagPool: ["#PayPal", "#UKBusiness", "#OnlinePayments", "#Ecommerce"],
  },
  stripe: {
    angles: ["merchant gateway", "online payments", "Shopify", "SaaS", "ecommerce"],
    hashtagPool: ["#StripeSetup", "#OnlinePayments", "#Shopify", "#SaaS", "#Ecommerce"],
  },
  "uk-ltd-formation": {
    angles: ["Companies House", "global credibility", "Pakistan founders", "non-resident founders", "banking readiness"],
    hashtagPool: ["#UKLTD", "#CompanyFormation", "#CompaniesHouse", "#GlobalBusiness", "#NonResidentFounders"],
  },
  "us-llc-formation": {
    angles: ["USA business presence", "EIN", "ecommerce", "global platforms"],
    hashtagPool: ["#USLLC", "#USABusiness", "#EIN", "#GlobalEntrepreneurs"],
  },
  "ltd-id-verification": {
    angles: ["KYC", "ACSP", "director verification", "identity verification", "compliance"],
    hashtagPool: ["#LTDVerification", "#KYC", "#ACSP", "#Compliance"],
  },
  "uk-business-address": {
    angles: ["credibility", "Companies House", "UK mailing address", "professional business image"],
    hashtagPool: ["#UKBusinessAddress", "#RegisteredOffice", "#CompaniesHouse", "#ProfessionalAddress"],
  },
  "web-development": {
    angles: ["premium website", "React", "Next.js", "Tailwind", "Framer Motion", "SEO", "speed", "UI/UX", "conversion"],
    hashtagPool: ["#WebDevelopment", "#PremiumWebsite", "#NextJS", "#UIUX", "#SEO"],
  },
};

export function getServiceStyle(slug?: string | null): ServiceStyle | null {
  if (!slug) return null;
  return SERVICE_STYLE_GUIDE[slug.toLowerCase()] ?? null;
}

// ─── 4. Few-shot style examples (AI-only reference) ─────────────────────────
// Shortened canonical samples — fed to the model as STYLE reference, never
// rendered verbatim to users. Each one already follows the 8-block template.
export const STYLE_EXAMPLES: string[] = [
  // Payoneer
  `${toBoldItalicUnicode("Set Up Your Payoneer Account")} 🌍

Tired of losing money on international payouts? ✅

At [Partner Brand], we help freelancers, ecommerce sellers and global founders open a fully verified Payoneer account through a safe, compliant, business-ready setup.

${BENEFITS_HEADER}

✔️ Global Receiving: Get paid from Amazon, eBay, Fiverr, Upwork worldwide.
✔️ Low FX Fees: Keep more of every payout in your local currency.
✔️ Marketplace Ready: Built for ecommerce sellers and freelancers.

Open your Payoneer account today 🚀

📧 Email: [Partner Email]
🌐 Website: [Partner Website]
📲 WhatsApp: [Partner WhatsApp]

#PayoneerAccount #GlobalPayments #Freelancers #EcommerceSellers`,

  // UK LTD Formation
  `${toBoldItalicUnicode("Register Your UK Limited Company")} 🇬🇧

Want global credibility without leaving home? ✅

At [Partner Brand], we help Pakistan and non-resident founders register a UK Limited Company through a Companies House compliant, banking-ready setup.

${BENEFITS_HEADER}

✔️ Companies House Registered: Official UK business in 24-48 hours.
✔️ Banking Ready: Documents structured for UK business accounts.
✔️ Global Credibility: Sell to clients worldwide under a UK entity.

Launch your UK company today 🚀

📧 Email: [Partner Email]
🌐 Website: [Partner Website]
📲 WhatsApp: [Partner WhatsApp]

#UKLTD #CompanyFormation #CompaniesHouse #NonResidentFounders`,

  // Web Development
  `${toBoldItalicUnicode("Launch Your Premium Website")} 🚀

Your brand deserves a website that actually converts. ✅

At [Partner Brand], we build premium, conversion-focused websites using React, Next.js, Tailwind and Framer Motion — fast, SEO-ready, and beautiful on every device.

${BENEFITS_HEADER}

✔️ Premium UI/UX: Modern design that builds instant trust.
✔️ SEO + Speed: Engineered for Google ranking and instant loads.
✔️ Conversion First: Every section designed to turn visitors into customers.

Book your website project today 🚀

📧 Email: [Partner Email]
🌐 Website: [Partner Website]
📲 WhatsApp: [Partner WhatsApp]

#WebDevelopment #PremiumWebsite #NextJS #UIUX #SEO`,
];

/** Compose a STYLE REFERENCE block to inject into AI system prompts. */
export function buildStyleReferenceBlock(serviceSlug?: string | null): string {
  const style = getServiceStyle(serviceSlug);
  const examples = STYLE_EXAMPLES.slice(0, 2).join("\n\n---\n\n");
  return [
    "DIGIFORMATION CAPTION STYLE — strict structure to follow:",
    "1) Bold italic Unicode headline (mathematical bold italic A-Z / a-z) + 1-2 emojis",
    "2) Short hook line ending with ✅",
    "3) Brand intro line: At [Partner Brand], we help…",
    `4) Benefits header: ${BENEFITS_HEADER}`,
    "5) Exactly 3 ✔️ benefit bullets — each 'Title: short explanation'",
    "6) Strong CTA line ending with 🚀",
    "7) Partner contact lines (📧 / 🌐 / 📲) — partner only, never DigiFormation",
    "8) 6-10 SEO hashtags (rotate naturally; include partner brand hashtag when possible)",
    style ? `\nSERVICE ANGLES TO WEAVE IN: ${style.angles.join(", ")}` : "",
    style ? `SUGGESTED HASHTAG POOL: ${style.hashtagPool.join(" ")}` : "",
    "\nREWRITE RULE: never copy any example word-for-word. Preserve structure + tone, rewrite uniquely every time.",
    "\nSTYLE EXAMPLES (reference only — do not output):\n" + examples,
  ].filter(Boolean).join("\n");
}
