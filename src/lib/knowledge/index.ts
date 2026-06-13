// Barrel export — single import surface for the DigiFormation Knowledge System.
//
//   import {
//     getServiceBySlug, buildAffiliateAssistantContext, ...
//   } from "@/lib/knowledge";
//
// Existing src/lib/digiformation-knowledge.ts stays in place; loaders here
// run alongside it and will replace it in a later phase.
export * from "./types";
export * from "./services";
export * from "./services-kb";
export * from "./coach-kb";
export * from "./sales-kb";
export * from "./journey-kb";
export * from "./packages";
export * from "./banking";
export * from "./marketing";
export * from "./publishing";
export * from "./faqs";
export * from "./partner-terms";
export * from "./brand-assets";
export * from "./context-builders";
