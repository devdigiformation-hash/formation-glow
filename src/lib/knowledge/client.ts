// Shared Supabase client + error helpers for knowledge loaders.
// Loaders accept an optional client so server fns can pass `context.supabase`
// while components fall back to the browser client.
import { supabase as defaultClient } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type KnowledgeClient = SupabaseClient;

export function resolveClient(client?: KnowledgeClient): KnowledgeClient {
  return client ?? (defaultClient as unknown as KnowledgeClient);
}

/** Log a non-fatal knowledge query failure without breaking the caller. */
export function logKnowledgeError(scope: string, error: unknown): void {
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn(`[knowledge:${scope}]`, error);
  }
}

/** Run a query and return `fallback` on error. Never throws.
 *  Accepts any thenable (PostgrestBuilder is thenable, not a Promise). */
export async function safeQuery<T>(
  scope: string,
  fn: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await fn();
    if (error) {
      logKnowledgeError(scope, error);
      return fallback;
    }
    return (data ?? fallback) as T;
  } catch (err) {
    logKnowledgeError(scope, err);
    return fallback;
  }
}
