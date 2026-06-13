// KD.4 — Partner Journey System.
// Single source of truth for the 10-step partner roadmap, the dashboard
// progress derivation, Next Best Action copy, and reference creative
// categories used by Rebrand Studio + the creative library.

import {
  Briefcase,
  Compass,
  UserCircle,
  BookOpen,
  Wand2,
  Megaphone,
  MessagesSquare,
  ShoppingBag,
  PoundSterling,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type JourneyStepKey =
  | "choose_service"
  | "find_brand"
  | "complete_profile"
  | "read_guide"
  | "first_creative"
  | "promote_creative"
  | "first_lead"
  | "first_order"
  | "first_commission"
  | "scale";

export interface JourneyStep {
  key: JourneyStepKey;
  step: number;
  label: string;
  icon: LucideIcon;
  to: string;
  nbaTitle: string;
  nbaDescription: string;
  coachPrompt: string; // ready-to-use Growth Coach prompt
  guideAnchor: string; // marketing guide card id
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: "choose_service",
    step: 1,
    label: "Choose a Service",
    icon: Briefcase,
    to: "/services",
    nbaTitle: "Pick a service to promote",
    nbaDescription: "Browse DigiFormation services and choose the one you'll take to market first.",
    coachPrompt: "Help me choose which DigiFormation service is best for me to promote first.",
    guideAnchor: "facebook-group-strategy",
  },
  {
    key: "find_brand",
    step: 2,
    label: "Build Brand",
    icon: Compass,
    to: "/build-brand",
    nbaTitle: "Build Brand",
    nbaDescription: "AI generates your name, theme and logo prompt — you just select, upload and launch.",
    coachPrompt: "Walk me through the Build Brand wizard step by step.",
    guideAnchor: "facebook-promotion",
  },
  {
    key: "complete_profile",
    step: 3,
    label: "Complete Profile",
    icon: UserCircle,
    to: "/partner-profile",
    nbaTitle: "Complete your Partner Profile",
    nbaDescription: "Add your name, contact and payout details so we can credit your wins.",
    coachPrompt: "Walk me through finishing my partner profile.",
    guideAnchor: "lead-generation-guide",
  },
  {
    key: "read_guide",
    step: 4,
    label: "Read Marketing Guide",
    icon: BookOpen,
    to: "/marketing-guide",
    nbaTitle: "Read the Marketing Guide",
    nbaDescription: "Get the 7-day launch plan, scripts and safe-marketing rules.",
    coachPrompt: "Give me a 7-day launch plan based on the marketing guide.",
    guideAnchor: "lead-generation-guide",
  },
  {
    key: "first_creative",
    step: 5,
    label: "Generate First Creative",
    icon: Wand2,
    to: "/rebrand-studio",
    nbaTitle: "Generate your first creative",
    nbaDescription: "Open Rebrand Studio and create a branded post in under a minute.",
    coachPrompt: "Give me 3 creative ideas I can generate today in Rebrand Studio.",
    guideAnchor: "facebook-promotion",
  },
  {
    key: "promote_creative",
    step: 6,
    label: "Promote Creative",
    icon: Megaphone,
    to: "/marketing-guide",
    nbaTitle: "Promote your first creative",
    nbaDescription: "Post in 5 niche groups, on your status, and DM 10 warm contacts.",
    coachPrompt: "Give me a promotion checklist for the creative I just generated.",
    guideAnchor: "whatsapp-promotion",
  },
  {
    key: "first_lead",
    step: 7,
    label: "Get First Lead",
    icon: MessagesSquare,
    to: "/smart-agent",
    nbaTitle: "Capture your first lead",
    nbaDescription: "Use the Growth Coach to reply, qualify and follow up with your first warm DM.",
    coachPrompt: "I just got a DM enquiry — help me reply and qualify it.",
    guideAnchor: "lead-generation-guide",
  },
  {
    key: "first_order",
    step: 8,
    label: "Get First Order",
    icon: ShoppingBag,
    to: "/my-orders",
    nbaTitle: "Close your first order",
    nbaDescription: "Send the secure payment link and confirm the order in your dashboard.",
    coachPrompt: "Give me the closing script for my first order.",
    guideAnchor: "referral-marketing",
  },
  {
    key: "first_commission",
    step: 9,
    label: "Receive First Commission",
    icon: PoundSterling,
    to: "/earnings",
    nbaTitle: "Track your first commission",
    nbaDescription: "Your first commission is on the way — review it in Earnings.",
    coachPrompt: "Explain how my commissions are calculated and paid.",
    guideAnchor: "referral-marketing",
  },
  {
    key: "scale",
    step: 10,
    label: "Scale Promotion",
    icon: TrendingUp,
    to: "/smart-agent",
    nbaTitle: "Scale what's working",
    nbaDescription: "Double down on the channel and creative that brought your first wins.",
    coachPrompt: "Give me a 30-day plan to scale my best-performing creative.",
    guideAnchor: "facebook-group-strategy",
  },
];

export const JOURNEY_STEP_COUNT = JOURNEY_STEPS.length;

// ----------------------------------------------------------------------------
// Derivation — turns live partner data into the 10-step checklist.
// ----------------------------------------------------------------------------

export interface JourneySignals {
  profile?: {
    full_name?: string | null;
    email?: string | null;
    whatsapp?: string | null;
    brand_name?: string | null;
    logo_url?: string | null;
  } | null;
  generatedCount: number;
  ordersCount: number;
  paidCommissions: number; // GBP total paid
  // Optional, defaulted to false unless persisted via localStorage / DB later.
  guideOpened?: boolean;
  servicePicked?: boolean;
  promotedCreative?: boolean;
  firstLeadCaptured?: boolean;
}

export interface JourneyStepState extends JourneyStep {
  done: boolean;
}

export function deriveJourney(signals: JourneySignals): JourneyStepState[] {
  const p = signals.profile;
  const profileDone = !!(p?.full_name && p?.email && p?.whatsapp);
  const brandDone = !!(p?.brand_name && p?.logo_url);

  const done: Record<JourneyStepKey, boolean> = {
    choose_service: signals.servicePicked ?? (signals.generatedCount > 0 || signals.ordersCount > 0),
    find_brand: brandDone,
    complete_profile: profileDone,
    read_guide: signals.guideOpened ?? false,
    first_creative: signals.generatedCount > 0,
    promote_creative: signals.promotedCreative ?? signals.generatedCount > 1,
    first_lead: signals.firstLeadCaptured ?? signals.ordersCount > 0,
    first_order: signals.ordersCount > 0,
    first_commission: signals.paidCommissions > 0,
    scale: signals.ordersCount >= 3,
  };

  return JOURNEY_STEPS.map((s) => ({ ...s, done: done[s.key] }));
}

export function journeyProgress(signals: JourneySignals): {
  pct: number;
  doneCount: number;
  remaining: number;
  nextStep: JourneyStepState | null;
} {
  const steps = deriveJourney(signals);
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done) ?? null;
  return {
    doneCount,
    remaining: steps.length - doneCount,
    pct: Math.round((doneCount / steps.length) * 100),
    nextStep: next,
  };
}

// Local-storage helpers for the "soft" signals not stored in DB yet.
export const JOURNEY_LOCAL_KEYS = {
  guideOpened: "df_journey_guide_opened",
  servicePicked: "df_journey_service_picked",
  promotedCreative: "df_journey_promoted",
  firstLead: "df_journey_first_lead",
} as const;

export function readSoftSignals(): Pick<
  JourneySignals,
  "guideOpened" | "servicePicked" | "promotedCreative" | "firstLeadCaptured"
> {
  if (typeof window === "undefined") return {};
  const read = (k: string) => window.localStorage.getItem(k) === "1";
  return {
    guideOpened: read(JOURNEY_LOCAL_KEYS.guideOpened),
    servicePicked: read(JOURNEY_LOCAL_KEYS.servicePicked),
    promotedCreative: read(JOURNEY_LOCAL_KEYS.promotedCreative),
    firstLeadCaptured: read(JOURNEY_LOCAL_KEYS.firstLead),
  };
}

export function markSoftSignal(key: keyof typeof JOURNEY_LOCAL_KEYS) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(JOURNEY_LOCAL_KEYS[key], "1");
}

// ----------------------------------------------------------------------------
// Reference Creative Categories — structure for the future creative library.
// ----------------------------------------------------------------------------

export interface CreativeCategory {
  slug: string;
  name: string;
  description: string;
  serviceSlugs: string[]; // ties back to services-kb
  templates: CreativeTemplate[];
}

export interface CreativeTemplate {
  id: string;
  title: string;
  format: "carousel" | "single" | "reel" | "story" | "poster";
  audience: string;
  hook: string;
  cta: string;
  hashtags: string[];
}

const T = (t: CreativeTemplate) => t;

export const CREATIVE_CATEGORIES: CreativeCategory[] = [
  {
    slug: "uk-ltd",
    name: "UK LTD",
    description: "Posts and reels positioning UK LTD formation for global founders.",
    serviceSlugs: ["uk-ltd-formation", "uk-business-address", "ltd-id-verification"],
    templates: [
      T({
        id: "uk-ltd-credibility",
        title: "Credibility upgrade in 48h",
        format: "carousel",
        audience: "Freelancers winning Western clients",
        hook: "Your foreign clients are judging your business before they reply.",
        cta: "DM 'UK' for the 48-hour setup plan.",
        hashtags: ["#UKLTD", "#FreelancerLife", "#GoGlobal"],
      }),
      T({
        id: "uk-ltd-myth",
        title: "Myth — you need to live in the UK",
        format: "reel",
        audience: "Founders abroad",
        hook: "You don't need a UK passport to own a UK company.",
        cta: "Comment 'GUIDE' for the step-by-step.",
        hashtags: ["#UKBusiness", "#CompaniesHouse"],
      }),
    ],
  },
  {
    slug: "us-llc",
    name: "US LLC",
    description: "Reels and carousels for US LLC + EIN bundle promotion.",
    serviceSlugs: ["us-llc-formation", "ein-number", "itin-number"],
    templates: [
      T({
        id: "us-llc-stripe",
        title: "Stripe US in 7 days",
        format: "carousel",
        audience: "SaaS founders, agencies",
        hook: "Stripe US is closer than you think — even without an SSN.",
        cta: "DM 'LLC' for the 7-day roadmap.",
        hashtags: ["#USLLC", "#StripeUS"],
      }),
    ],
  },
  {
    slug: "banking",
    name: "Banking",
    description: "Wise / Payoneer / Airwallex / WorldFirst creatives.",
    serviceSlugs: ["wise", "payoneer", "airwallex", "worldfirst", "pingpong", "sunrate", "grey"],
    templates: [
      T({
        id: "banking-fx-pain",
        title: "Stop losing 5% on every payout",
        format: "single",
        audience: "Freelancers, sellers",
        hook: "Banks rob you on FX. Here's the fix.",
        cta: "DM 'BANK' for the right account for your case.",
        hashtags: ["#Wise", "#Payoneer"],
      }),
    ],
  },
  {
    slug: "stripe",
    name: "Stripe",
    description: "First-try approval angle for Stripe across LTD + LLC.",
    serviceSlugs: ["stripe"],
    templates: [
      T({
        id: "stripe-first-try",
        title: "Approved on the first try",
        format: "reel",
        audience: "Rejected applicants",
        hook: "Stripe rejected you? It's almost never the form.",
        cta: "Comment 'STRIPE' for the fix.",
        hashtags: ["#Stripe", "#OnlinePayments"],
      }),
    ],
  },
  {
    slug: "paypal",
    name: "PayPal",
    description: "Trust at checkout + freeze-avoidance content.",
    serviceSlugs: ["paypal"],
    templates: [
      T({
        id: "paypal-trust",
        title: "Win the PayPal-only buyer",
        format: "single",
        audience: "Coaches, e-com, freelancers",
        hook: "Lost a sale because you didn't offer PayPal? Stop that.",
        cta: "DM 'PAYPAL' to set it up safely.",
        hashtags: ["#PayPal", "#Ecommerce"],
      }),
    ],
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    description: "Amazon / Shopify / Etsy seller content across multiple services.",
    serviceSlugs: ["uk-ltd-formation", "us-llc-formation", "wise", "worldfirst", "pingpong", "vat-registration"],
    templates: [
      T({
        id: "ecom-amazon-uk",
        title: "Sell on Amazon UK in 7 days",
        format: "carousel",
        audience: "Aspiring Amazon sellers",
        hook: "Amazon UK is open to you — here's the legal stack.",
        cta: "DM 'AMAZON' for the stack.",
        hashtags: ["#AmazonFBA", "#UKLTD"],
      }),
    ],
  },
  {
    slug: "web-development",
    name: "Web Development",
    description: "Conversion-focused website + SEO + digital marketing creatives.",
    serviceSlugs: ["website-development", "seo-services", "digital-marketing"],
    templates: [
      T({
        id: "web-247",
        title: "Your site is your 24/7 salesperson",
        format: "single",
        audience: "Local businesses, agencies",
        hook: "Your website is your 24/7 salesperson. Is yours sleeping on the job?",
        cta: "DM 'SITE' for a free audit.",
        hashtags: ["#WebDesign", "#SEO"],
      }),
    ],
  },
];

export const CREATIVE_CATEGORY_SLUGS = CREATIVE_CATEGORIES.map((c) => c.slug);
export function getCreativeCategory(slug: string): CreativeCategory | undefined {
  return CREATIVE_CATEGORIES.find((c) => c.slug === slug);
}
