// Shared helpers for premium AI access control, per-day quota enforcement,
// and observability. Server-only.

import type { SupabaseClient } from "@supabase/supabase-js";

export const PREMIUM_PROVIDERS = ["lovable_gateway"] as const;
export type AiProvider =
  | "pollinations"
  | "lovable_gateway"
  | "replicate"
  | "fal"
  | "huggingface"
  | "cloudflare";

export type AiTool = "smart_rebrand" | "marketing" | "image" | "enhance" | "smart_agent";

export async function userIsAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    console.error("[ai-access] userIsAdmin lookup failed:", error.message);
    return false;
  }
  return !!data;
}

export async function assertAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  if (!(await userIsAdmin(supabase, userId))) {
    throw new Error(
      "This is a premium admin-only feature. Partners default to the free Pollinations provider to protect workspace credits.",
    );
  }
}

/**
 * Hard per-day quota check. Calls the `check_ai_quota` SECURITY DEFINER
 * function. Throws a user-facing error when the partner is over their
 * daily allowance for the given tool. Admins are always unlimited
 * (daily_limit = -1 in ai_quotas).
 */
export async function enforceQuota(
  supabase: SupabaseClient,
  userId: string,
  tool: AiTool,
): Promise<{ used: number; limit: number; tier: string }> {
  const { data, error } = await supabase.rpc("check_ai_quota", {
    _user_id: userId,
    _tool: tool,
  });
  if (error) {
    console.error("[ai-access] check_ai_quota RPC failed:", error.message);
    // Fail closed for premium tools; open for free image tier to avoid
    // breaking the free flow on a transient DB hiccup.
    if (tool === "image") {
      return { used: 0, limit: -1, tier: "unknown" };
    }
    throw new Error("Quota check unavailable. Please try again shortly.");
  }
  const row = Array.isArray(data) ? data[0] : data;
  const allowed = row?.allowed ?? false;
  const used = Number(row?.used ?? 0);
  const limit = Number(row?.daily_limit ?? 0);
  const tier = String(row?.tier ?? "free");
  if (!allowed) {
    throw new Error(
      `Daily ${toolLabel(tool)} limit reached (${used}/${limit} for ${tier} tier). Upgrade your tier or try again tomorrow.`,
    );
  }
  return { used, limit, tier };
}

function toolLabel(tool: AiTool): string {
  switch (tool) {
    case "smart_rebrand": return "Smart Rebrand";
    case "marketing":     return "Marketing AI";
    case "image":         return "Image generation";
    case "enhance":       return "Prompt enhancement";
    case "smart_agent":   return "Smart Agent";
  }
}

export async function recordAiUsage(
  supabase: SupabaseClient,
  args: {
    partnerId: string;
    provider: AiProvider | string;
    model?: string;
    success: boolean;
    errorMessage?: string | null;
  },
): Promise<void> {
  const { error } = await supabase.from("ai_usage").insert({
    partner_id: args.partnerId,
    provider: args.provider,
    model: args.model ?? "",
    success: args.success,
    error_message: args.errorMessage ?? null,
  });
  if (error) {
    // Observability: surface, do NOT swallow. We don't throw because
    // tracking must not break the user flow, but every failure is logged.
    console.error(
      `[ai-usage] insert failed (partner=${args.partnerId} provider=${args.provider} success=${args.success}): ${error.message}`,
    );
  }
}
