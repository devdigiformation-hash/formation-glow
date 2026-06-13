// Master knowledge base for the DigiFormation AI Assistant.
// Combines all FAQ modules into one block injected into the system prompt.
// Order matters: the live-website KB is FIRST so it takes priority on
// pricing, packages and official service details.

import { DIGIFORMATION_WEBSITE_KB } from "./digiformation-website-kb";
import { UK_FORMATION_FAQS } from "./uk-formation-faqs";
import { US_LLC_FAQS } from "./us-llc-faqs";
import { BANKING_FAQS } from "./banking-faqs";
import { PAYMENTS_FAQS } from "./payments-faqs";
import { ECOMMERCE_FAQS } from "./ecommerce-faqs";
import { DIGIFORMATION_SERVICES_FAQS } from "./digiformation-services-faqs";
import { GROWTH_COACH_KNOWLEDGE_WITH_SALES } from "./growth-coach";
import { DIGIFORMATION_MASTER_FAQS } from "./master-faqs";

export const DIGIFORMATION_MASTER_KB = [
  DIGIFORMATION_WEBSITE_KB,
  DIGIFORMATION_SERVICES_FAQS,
  DIGIFORMATION_MASTER_FAQS,
  UK_FORMATION_FAQS,
  US_LLC_FAQS,
  BANKING_FAQS,
  PAYMENTS_FAQS,
  ECOMMERCE_FAQS,
  GROWTH_COACH_KNOWLEDGE_WITH_SALES,
].join("\n\n");
