// ============================================================================
// DigiFormation Knowledge Layer
// ----------------------------------------------------------------------------
// Static, structured knowledge extracted from:
//   - https://www.digiformation.uk
//   - https://linktr.ee/digiformationltd
//   - Service pages, blog, FAQ, pricing, admin creatives, brand positioning
//
// This is the single source of truth used by every AI tool (Smart Agent,
// Rebrand Studio, Ad Copy, Caption, Hashtag, Marketing Pack, WhatsApp).
// Built once, reused everywhere. No runtime crawling.
// ============================================================================

export type DigiService = {
  id: string;
  name: string;
  category: "UK Formation" | "USA Formation" | "Compliance" | "Banking" | "Payments" | "Tax" | "Technology" | "Identity";
  url: string;
  description: string;
  benefits: string[];
  keywords: string[];
  ctas: string[];
};

export const DIGIFORMATION_BRAND = {
  legalName: "Digiformation Ltd",
  shortName: "DigiFormation",
  founder: "Muhammad Haroon",
  website: "https://www.digiformation.uk",
  linktree: "https://linktr.ee/digiformationltd",
  whatsapp: "+92 316 4467464",
  whatsappLink: "https://wa.me/923164467464",
  tagline: "Establish Your UK or US Business in Days",
  positioning:
    "Fast, transparent and fully supported company formation, banking, payments, compliance and web services for entrepreneurs worldwide.",
  proof: [
    "Founder is director of 71+ active UK companies on Companies House",
    "300+ clients served worldwide",
    "98% client retention rate",
    "Companies House Authorised · IRS Acceptance Agent Network",
    "8+ years industry experience",
  ],
  pillars: [
    "Speed & Efficiency — most setups completed within days",
    "Transparency — clear upfront pricing, no hidden fees",
    "Full Compliance — UTR, EIN/ITIN, ID verification, annual filings",
    "Global Expertise — multi-jurisdiction regulatory knowledge",
    "Dedicated Support — personal account managers, no ticket queues",
  ],
  partners: [
    "Companies House", "HMRC", "IRS",
    "Tide", "Wise", "Payoneer", "Airwallex", "WorldFirst", "Sunrate", "Zyla", "Wallester",
    "Stripe", "PayPal", "Mollie",
    "Shopify", "eBay", "Amazon",
  ],
  toneOfVoice:
    "Professional, confident, UK English. Founder-led, trustworthy, practical. Short punchy sentences. No fluff.",
} as const;

export const DIGI_SERVICES: DigiService[] = [
  {
    id: "uk-ltd-formation",
    name: "UK LTD Company Formation",
    category: "UK Formation",
    url: "https://www.digiformation.uk/uk-services/uk-ltd-formation",
    description:
      "Register a UK Limited Company with Companies House. Fast, compliant, managed from anywhere in the world. Includes UTR, registered office and full compliance support.",
    benefits: ["Companies House authorised", "Remote setup worldwide", "UTR + registered office included", "Days, not weeks"],
    keywords: ["UK LTD", "UK company formation", "Companies House", "register UK company", "limited company UK", "UK Ltd setup", "non-resident UK company"],
    ctas: ["Register your UK Ltd today", "Form your UK company in days", "Start your UK Ltd now"],
  },
  {
    id: "us-llc-formation",
    name: "US LLC Formation",
    category: "USA Formation",
    url: "https://www.digiformation.uk/usa-services/us-llc-formation",
    description:
      "Register a US LLC remotely with EIN, ITIN (if applicable), registered agent and BOI report. Access PayPal, Stripe, Amazon and the full US market without being physically present.",
    benefits: ["Any state available", "EIN + registered agent included", "Access US Stripe, PayPal, Amazon", "BOI report handled"],
    keywords: ["US LLC", "USA LLC formation", "non-resident LLC", "Wyoming LLC", "Delaware LLC", "EIN", "ITIN", "BOI report"],
    ctas: ["Form your US LLC remotely", "Open your US LLC today", "Start selling in the US"],
  },
  {
    id: "ltd-id-verification",
    name: "LTD ID Verification (Companies House)",
    category: "Identity",
    url: "https://www.digiformation.uk/uk-services/ltd-id-verification",
    description:
      "Companies House identity verification for directors, PSCs and shareholders. DIATF compliant. Verified in 24 hours from £20.",
    benefits: ["Mandatory for PSCs, shareholders, directors", "Verified in 24 hours", "Companies House compliant", "From £20"],
    keywords: ["ID verification", "Companies House IDV", "DIATF", "director verification", "PSC verification", "UK identity verification"],
    ctas: ["Verify your identity in 24 hours", "Get DIATF verified today", "Complete your Companies House IDV"],
  },
  {
    id: "company-compliance",
    name: "Company Compliance Services",
    category: "Compliance",
    url: "https://www.digiformation.uk/uk-compliance/confirmation-statement",
    description:
      "Name change, director updates, address change, SIC code, PSC, shareholders, confirmation statements and all statutory returns submitted on time.",
    benefits: ["All statutory filings handled", "Deadline reminders", "Certified specialists", "Avoid penalties"],
    keywords: ["confirmation statement", "company compliance", "annual filing UK", "director change", "registered office change", "PSC update"],
    ctas: ["Stay 100% compliant", "File your confirmation statement", "Outsource your UK compliance"],
  },
  {
    id: "annual-filing",
    name: "Company Annual Filing",
    category: "Compliance",
    url: "https://www.digiformation.uk/uk-services/company-annual-filing",
    description:
      "Confirmation statements, annual accounts and all statutory returns submitted to Companies House on time.",
    benefits: ["No missed deadlines", "Dormant + trading accounts", "Companies House + HMRC ready"],
    keywords: ["annual accounts", "dormant accounts", "Companies House filing", "annual return UK"],
    ctas: ["File your annual accounts", "Never miss a deadline again"],
  },
  {
    id: "tax-utr",
    name: "UTR, EIN, ITIN & VAT Registration",
    category: "Tax",
    url: "https://www.digiformation.uk/uk-services/utr-codes",
    description:
      "UTR, EIN, ITIN, VAT registration, BOI reports and annual filings — all handled by our specialists.",
    benefits: ["HMRC + IRS handled end-to-end", "Faster turnarounds", "Expert specialists"],
    keywords: ["UTR", "EIN", "ITIN", "VAT registration", "HMRC", "IRS", "BOI report"],
    ctas: ["Get your UTR / EIN / ITIN", "Register for VAT today"],
  },
  {
    id: "banking",
    name: "Business Banking",
    category: "Banking",
    url: "https://www.digiformation.uk/banks-payment-solutions/tide",
    description:
      "Activate multi-currency business accounts with Tide, Sunrate, WorldFirst, Wise, Airwallex, Payoneer, Zyla, Wallester and more. Fast, verified, ready to trade.",
    benefits: ["Multi-currency accounts", "Verified merchant-ready", "10+ banking partners", "Global coverage"],
    keywords: ["Tide", "Wise", "Airwallex", "WorldFirst", "Payoneer", "Sunrate", "Zyla", "Wallester", "business bank account", "multi-currency account"],
    ctas: ["Open your business bank account", "Get multi-currency banking", "Activate your business account"],
  },
  {
    id: "payments",
    name: "Payment Gateway Setup (Stripe / PayPal / Mollie)",
    category: "Payments",
    url: "https://www.digiformation.uk/banks-payment-solutions/stripe",
    description:
      "Accept payments worldwide with verified Stripe, PayPal and Mollie merchant accounts — fully ready for your UK or US business.",
    benefits: ["Verified merchant accounts", "Global card acceptance", "Stripe + PayPal + Mollie", "Works with Shopify, eBay, Amazon"],
    keywords: ["Stripe", "PayPal", "Mollie", "payment gateway", "merchant account", "accept payments online", "Stripe UK", "Stripe USA"],
    ctas: ["Start accepting payments worldwide", "Get verified on Stripe & PayPal", "Activate your payment gateway"],
  },
  {
    id: "web-development",
    name: "Web Development",
    category: "Technology",
    url: "https://www.digiformation.uk/web-development",
    description:
      "Professional websites, landing pages and e-commerce stores — SEO-ready, business-ready, concept to launch.",
    benefits: ["Custom websites + landing pages", "SEO-ready", "E-commerce capable", "Concept to launch"],
    keywords: ["web development", "business website", "landing page", "e-commerce store", "Shopify build", "SEO website"],
    ctas: ["Launch your business website", "Get a professional landing page", "Build your online store"],
  },
];

// Lookup helpers --------------------------------------------------------------

export function findServiceByName(query?: string): DigiService | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase();
  return (
    DIGI_SERVICES.find((s) => s.name.toLowerCase() === q) ??
    DIGI_SERVICES.find((s) => q.includes(s.id.replace(/-/g, " "))) ??
    DIGI_SERVICES.find((s) => s.keywords.some((k) => q.includes(k.toLowerCase()))) ??
    DIGI_SERVICES.find((s) => s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase()))
  );
}

// Compact knowledge block for AI system prompts. Keep <2k tokens.
export function buildKnowledgeBlock(): string {
  const services = DIGI_SERVICES.map(
    (s) =>
      `• ${s.name} [${s.category}] — ${s.description} Keywords: ${s.keywords.slice(0, 6).join(", ")}.`,
  ).join("\n");
  return `DIGIFORMATION KNOWLEDGE BASE
Brand: ${DIGIFORMATION_BRAND.legalName} (${DIGIFORMATION_BRAND.shortName}) — founded by ${DIGIFORMATION_BRAND.founder}.
Positioning: ${DIGIFORMATION_BRAND.positioning}
Tagline: ${DIGIFORMATION_BRAND.tagline}
Website: ${DIGIFORMATION_BRAND.website} · WhatsApp: ${DIGIFORMATION_BRAND.whatsapp}
Authority: ${DIGIFORMATION_BRAND.proof.join(" · ")}
Pillars: ${DIGIFORMATION_BRAND.pillars.join(" | ")}
Partners: ${DIGIFORMATION_BRAND.partners.join(", ")}
Tone: ${DIGIFORMATION_BRAND.toneOfVoice}

SERVICES:
${services}

RULES FOR AI:
- Always speak in the context of DigiFormation's real services above.
- Never invent services, pricing, or partners not listed here.
- Match the user's selected service to the closest entry above and use its keywords, benefits and CTAs.
- Reference Companies House / HMRC / IRS authority where credible.
- UK English. Professional, confident, founder-led tone.`;
}

// Service-specific context block (richer, single service).
export function buildServiceContext(serviceName?: string, fallbackCategory?: string): string {
  const svc = findServiceByName(serviceName) ?? findServiceByName(fallbackCategory);
  if (!svc) {
    return `Service not matched. Use generic DigiFormation positioning: ${DIGIFORMATION_BRAND.positioning}`;
  }
  return `DigiFormation Service Context
Service: ${svc.name}  (category: ${svc.category})
URL: ${svc.url}
Description: ${svc.description}
Key benefits: ${svc.benefits.join("; ")}
SEO keywords: ${svc.keywords.join(", ")}
Suggested CTAs: ${svc.ctas.join(" / ")}
Brand authority to reference: ${DIGIFORMATION_BRAND.proof.slice(0, 3).join(" · ")}`;
}
