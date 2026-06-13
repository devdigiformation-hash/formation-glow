// Map a DigiFormation service → the matching Rebrand Studio creative category.
import { CREATIVE_CATEGORIES, type CreativeCategory } from "@/lib/creative-categories";

const NAME_MAP: Record<string, CreativeCategory> = {
  "UK LTD Formation": "UK LTD Formation",
  "USA LLC Formation": "USA LLC Formation",
  "Stripe Setup": "Stripe Setup",
  "PayPal Setup": "PayPal Setup",
  "Wise Business": "Wise Business",
  "Business Banking": "Business Banking",
  "Website Development": "Website Development",
  "UK Compliance": "Compliance Services",
  "ID Verification": "Compliance Services",
};

export function creativeCategoryForService(name: string | null | undefined): CreativeCategory | "All" {
  if (!name) return "All";
  if (NAME_MAP[name]) return NAME_MAP[name];
  const match = (CREATIVE_CATEGORIES as readonly string[]).find(
    (c) => c.toLowerCase() === name.toLowerCase(),
  );
  return (match as CreativeCategory) ?? "All";
}
