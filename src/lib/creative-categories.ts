// Shared constants for the Creative System. Pure data — no storage.
export const CREATIVE_CATEGORIES = [
  "UK LTD Formation",
  "USA LLC Formation",
  "Stripe Setup",
  "PayPal Setup",
  "Wise Business",
  "Business Banking",
  "Compliance Services",
  "Website Development",
  "General Marketing",
] as const;

export type CreativeCategory = (typeof CREATIVE_CATEGORIES)[number];

const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.42 0.14 220), oklch(0.30 0.12 280))",
  "linear-gradient(135deg, oklch(0.40 0.15 30), oklch(0.32 0.13 350))",
  "linear-gradient(135deg, oklch(0.40 0.14 160), oklch(0.32 0.12 210))",
  "linear-gradient(135deg, oklch(0.42 0.16 295), oklch(0.34 0.14 230))",
  "linear-gradient(135deg, oklch(0.40 0.14 90), oklch(0.32 0.12 180))",
  "linear-gradient(135deg, oklch(0.42 0.14 260), oklch(0.34 0.12 320))",
  "linear-gradient(135deg, oklch(0.40 0.14 50), oklch(0.32 0.12 130))",
  "linear-gradient(135deg, oklch(0.38 0.13 175), oklch(0.30 0.11 240))",
];

/** Deterministic gradient pick keyed by string (e.g. creative id). */
export function gradientFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}
