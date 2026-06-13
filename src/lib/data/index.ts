// =============================================================================
// Data layer barrel — single import surface for UI code.
//
//   import {
//     usePartnerProfile, useServices, useManualLeads, useCommissions,
//     useAdminCreatives, useGeneratedCreatives, useAIUsage, useDownloads,
//   } from "@/lib/data";
//
// When Supabase replaces localStorage, ONLY the files in this folder change.
// =============================================================================

export * from "./types";
export * from "./hooks";

export { Collection, useCollection } from "./store";
