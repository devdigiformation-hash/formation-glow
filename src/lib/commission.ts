// Commission & service catalogue for DigiFormation Partner Hub.
// Sourced from DigiFormation_B2B_RateList_v5 + www.digiformation.uk service pages.
// Commission earned by partner per confirmed sale = Retail − B2B (the "saving").

export type Currency = "GBP" | "USD";
export type Region = "UK" | "USA" | "Global";

export type ServiceDef = {
  name: string;
  category: string;
  region: Region;
  currency: Currency;
  retail: number;       // retail price (client-facing)
  b2b: number | null;   // partner / reseller B2B rate, null = quote required
  description: string;
  badge?: string;       // e.g. STARTER / SILVER / GOLD / PLATINUM / VAT / PREMIUM
};

export const SERVICES: ServiceDef[] = [
  // ─── UK LTD Company Packages ──────────────────────────────────────────────
  { name: "UK LTD Starter", category: "Company Formation", region: "UK", currency: "GBP", retail: 140, b2b: 125, badge: "STARTER", description: "Basic UK LTD registration with Companies House — ready in 24 hours." },
  { name: "UK LTD Silver", category: "Company Formation", region: "UK", currency: "GBP", retail: 170, b2b: 145, badge: "SILVER", description: "Enhanced UK LTD formation package with extras." },
  { name: "UK LTD Gold", category: "Company Formation", region: "UK", currency: "GBP", retail: 180, b2b: 155, badge: "GOLD", description: "Premium UK LTD formation package." },
  { name: "UK LTD Platinum", category: "Company Formation", region: "UK", currency: "GBP", retail: 200, b2b: 190, badge: "PLATINUM", description: "Elite UK LTD formation package — full white-glove." },
  { name: "UK LTD + VAT Registration", category: "Company Formation", region: "UK", currency: "GBP", retail: 280, b2b: 260, badge: "VAT", description: "UK LTD formation bundled with HMRC VAT registration." },

  // ─── UK Address Services ──────────────────────────────────────────────────
  { name: "Registered Office Address (UK)", category: "Address", region: "UK", currency: "GBP", retail: 30, b2b: 25, description: "UK registered business address — annual." },
  { name: "Registered + Director Service Address", category: "Address", region: "UK", currency: "GBP", retail: 35, b2b: 30, description: "Bundle: registered office + director service address." },
  { name: "Director Service Address Only", category: "Address", region: "UK", currency: "GBP", retail: 15, b2b: 10, description: "Standalone director service address (annual)." },
  { name: "Trading / Virtual Address", category: "Address", region: "UK", currency: "GBP", retail: 80, b2b: 70, description: "City-bound business trading address (annual)." },

  // ─── UK Compliance ────────────────────────────────────────────────────────
  { name: "Confirmation Statement (UK)", category: "Compliance", region: "UK", currency: "GBP", retail: 10, b2b: 5, description: "Annual Companies House confirmation statement filing." },
  { name: "Annual Tax Filing", category: "Compliance", region: "UK", currency: "GBP", retail: 20, b2b: 10, description: "Corporation tax / HMRC annual accounts filing." },
  { name: "Director ID Verification", category: "Compliance", region: "UK", currency: "GBP", retail: 25, b2b: 20, description: "Standalone Companies House director ID verification (DIATF)." },

  // ─── UK Company Changes ───────────────────────────────────────────────────
  { name: "UK Address Change", category: "Compliance", region: "UK", currency: "GBP", retail: 10, b2b: 5, description: "Registered office address update." },
  { name: "Director Change (without ID)", category: "Compliance", region: "UK", currency: "GBP", retail: 10, b2b: 5, description: "Director appointment / resignation — ID already verified." },
  { name: "Director Change (with ID)", category: "Compliance", region: "UK", currency: "GBP", retail: 30, b2b: 25, description: "Director change + Companies House ID verification." },
  { name: "UK Country Residence Change", category: "Compliance", region: "UK", currency: "GBP", retail: 10, b2b: 5, description: "Country of residence update." },
  { name: "Company Name Change", category: "Compliance", region: "UK", currency: "GBP", retail: 10, b2b: 5, description: "Official UK company name update." },
  { name: "SIC Code Change", category: "Compliance", region: "UK", currency: "GBP", retail: 10, b2b: 5, description: "Standard industrial classification code update." },

  // ─── UK Banking & Payments ────────────────────────────────────────────────
  { name: "PayPal (UK)", category: "Banking", region: "UK", currency: "GBP", retail: 15, b2b: 10, description: "UK PayPal business account opening." },
  { name: "Stripe (UK)", category: "Payments", region: "UK", currency: "GBP", retail: 15, b2b: 10, description: "UK Stripe business account opening." },
  { name: "Payoneer (UK)", category: "Banking", region: "UK", currency: "GBP", retail: 25, b2b: 20, description: "Payoneer UK business account opening." },
  { name: "Wise Business (UK)", category: "Banking", region: "UK", currency: "GBP", retail: 25, b2b: 20, description: "Wise / TransferWise UK business account opening." },
  { name: "WorldFirst (UK)", category: "Banking", region: "UK", currency: "GBP", retail: 20, b2b: 15, description: "WorldFirst UK business account opening." },
  { name: "Tide Bank (UK)", category: "Banking", region: "UK", currency: "GBP", retail: 50, b2b: 30, description: "Tide UK business account opening." },
  { name: "SunRate Bank (UK)", category: "Banking", region: "UK", currency: "GBP", retail: 50, b2b: 30, description: "SunRate UK business account opening." },

  // ─── Website Design ───────────────────────────────────────────────────────
  { name: "Basic Website", category: "Digital", region: "Global", currency: "GBP", retail: 60, b2b: 50, badge: "BASIC", description: "React-based basic business website." },
  { name: "Standard Website", category: "Digital", region: "Global", currency: "GBP", retail: 120, b2b: 100, badge: "STANDARD", description: "React-based standard business website." },
  { name: "Premium Website", category: "Digital", region: "Global", currency: "GBP", retail: 300, b2b: 270, badge: "PREMIUM", description: "React-based premium business website." },

  // ─── USA LLC Packages (Montana) ───────────────────────────────────────────
  { name: "USA LLC Starter (Montana)", category: "Company Formation", region: "USA", currency: "USD", retail: 150, b2b: null, badge: "STARTER", description: "Basic US LLC formation — Montana. B2B rate on request." },
  { name: "USA LLC Silver (Montana)", category: "Company Formation", region: "USA", currency: "USD", retail: 200, b2b: null, badge: "SILVER", description: "Enhanced US LLC formation — Montana. B2B rate on request." },
  { name: "USA LLC Gold (Montana)", category: "Company Formation", region: "USA", currency: "USD", retail: 400, b2b: null, badge: "GOLD", description: "Premium US LLC formation — Montana. B2B rate on request. Other states available — pricing depends on state filing fees." },

  // ─── USA Banking ──────────────────────────────────────────────────────────
  { name: "Zyla Bank (USA)", category: "Banking", region: "USA", currency: "USD", retail: 20, b2b: 15, description: "US Zyla business account opening." },
  { name: "Payoneer (USA)", category: "Banking", region: "USA", currency: "USD", retail: 25, b2b: 20, description: "US Payoneer business account opening." },
  { name: "Wise Business (USA)", category: "Banking", region: "USA", currency: "USD", retail: 25, b2b: 20, description: "US Wise business account opening." },
  { name: "SunRate (USA)", category: "Banking", region: "USA", currency: "USD", retail: 50, b2b: 30, description: "US SunRate business account opening." },
];

export const SERVICE_NAMES = SERVICES.map((s) => s.name);

// Backwards-compat: commission per sale = retail − b2b (the partner saving).
export const DEFAULT_COMMISSION_GBP = 20;
export const ID_VERIFICATION_COMMISSION_GBP = 5;

export function commissionForService(serviceName: string): number {
  const s = SERVICES.find((x) => x.name.toLowerCase() === serviceName.toLowerCase());
  if (s && s.b2b != null) return Math.max(0, s.retail - s.b2b);
  return /id\s*verification/i.test(serviceName)
    ? ID_VERIFICATION_COMMISSION_GBP
    : DEFAULT_COMMISSION_GBP;
}

export function formatGbp(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

export function formatPrice(amount: number, currency: Currency): string {
  const symbol = currency === "USD" ? "$" : "£";
  const locale = currency === "USD" ? "en-US" : "en-GB";
  return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}
