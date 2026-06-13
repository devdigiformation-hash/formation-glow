// Legacy localStorage migration — no longer applicable now that data lives in
// Supabase. Kept as a no-op so existing imports continue to resolve.
export function runLegacyMigration(_adminUserId: string): void {
  /* noop — Phase 13 moved storage to Supabase. */
}
