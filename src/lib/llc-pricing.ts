// =============================================================================
// LLC pricing configuration — centralised so admins can edit one place.
// Retail prices per state per package (USD). B2B = retail - margin rule:
//   Starter: retail - $20
//   Silver:  retail - $30
//   Gold:    retail - $50
// =============================================================================
export type LlcPackageId = "starter" | "silver" | "gold";

export type LlcPackage = {
  id: LlcPackageId;
  label: string;
  tagline: string;
  includes: string[];
};

export const LLC_PACKAGES: LlcPackage[] = [
  {
    id: "starter",
    label: "Starter",
    tagline: "Essential filing only",
    includes: [
      "State LLC filing",
      "Registered agent (Year 1)",
      "Articles of Organization",
      "Email support",
    ],
  },
  {
    id: "silver",
    label: "Silver",
    tagline: "Operational ready",
    includes: [
      "Everything in Starter",
      "EIN application support",
      "Operating Agreement template",
      "Compliance reminders",
    ],
  },
  {
    id: "gold",
    label: "Gold",
    tagline: "Banking + payments ready",
    includes: [
      "Everything in Silver",
      "Mercury / Wise application support",
      "Stripe / PayPal setup guidance",
      "Priority partner support",
    ],
  },
];

export const LLC_PACKAGE_MARGIN: Record<LlcPackageId, number> = {
  starter: 20,
  silver: 30,
  gold: 50,
};

export type LlcState = {
  code: string;
  name: string;
  highlight?: string;
  retail: Record<LlcPackageId, number>;
};

export const LLC_STATES: LlcState[] = [
  {
    code: "WY",
    name: "Wyoming",
    highlight: "Lowest annual fees, strong privacy",
    retail: { starter: 199, silver: 249, gold: 349 },
  },
  {
    code: "NM",
    name: "New Mexico",
    highlight: "Anonymous LLCs, no annual report",
    retail: { starter: 179, silver: 229, gold: 329 },
  },
  {
    code: "DE",
    name: "Delaware",
    highlight: "Investor-friendly, Chancery Court",
    retail: { starter: 249, silver: 299, gold: 399 },
  },
  {
    code: "FL",
    name: "Florida",
    highlight: "No state income tax, US market access",
    retail: { starter: 229, silver: 279, gold: 379 },
  },
  {
    code: "TX",
    name: "Texas",
    highlight: "Large US market, business-friendly",
    retail: { starter: 249, silver: 299, gold: 399 },
  },
  {
    code: "NV",
    name: "Nevada",
    highlight: "No state income tax, strong privacy",
    retail: { starter: 259, silver: 309, gold: 409 },
  },
];

export function llcB2bPrice(retail: number, packageId: LlcPackageId): number {
  return Math.max(0, retail - LLC_PACKAGE_MARGIN[packageId]);
}

export function llcProfit(retail: number, packageId: LlcPackageId): number {
  return LLC_PACKAGE_MARGIN[packageId];
}
