import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, enforceQuota, recordAiUsage } from "./ai-access.server";

const SYSTEM_PROMPT = `You are an AI image-prompt creation expert. Rewrite the user's brief into ONE highly detailed, photorealistic image prompt following this structure:
[Main Scene] | [Key Elements] | [Text Integration if any] | [Lighting & Atmosphere] | [Technical Parameters] | [Style Parameters]

Rules:
- Output ONLY the final prompt as a single line of plain text. No JSON, no quotes, no preface, no markdown.
- 8k, hyperrealistic, cinematic composition, sharp focus.
- Keep any on-image text short (<20 chars) and legible.
- Never include disallowed content.`;

export const enhancePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prompt: string }) => {
    const p = (input?.prompt ?? "").toString().trim();
    if (!p) throw new Error("Prompt is required");
    if (p.length > 2000) throw new Error("Prompt too long");
    return { prompt: p };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Premium: only admin can consume Lovable AI credits for enhancement.
    await assertAdmin(supabase, userId);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: data.prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: "lovable_gateway",
        model: "google/gemini-2.5-flash",
        success: false,
        errorMessage: `enhance:${res.status}`,
      });
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      throw new Error(`Prompt enhancement failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const enhanced = json.choices?.[0]?.message?.content?.trim();
    if (!enhanced) throw new Error("Empty response from AI.");
    await recordAiUsage(supabase, {
      partnerId: userId,
      provider: "lovable_gateway",
      model: "google/gemini-2.5-flash",
      success: true,
    });
    return { enhanced };
  });

// Partner-safe usage tracker — call from client when running the free
// Pollinations provider so we still record per-partner volume.
export const trackPollinationsUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { success: boolean; errorMessage?: string }) => ({
    success: !!input?.success,
    errorMessage: input?.errorMessage,
  }))
  .handler(async ({ data, context }) => {
    // Per-day image quota also applies to free Pollinations runs:
    // free=20, premium=200, admin=unlimited. We enforce only on success
    // tracking so failures (which weren't billed) don't deplete quota.
    if (data.success) {
      await enforceQuota(context.supabase, context.userId, "image");
    }
    await recordAiUsage(context.supabase, {
      partnerId: context.userId,
      provider: "pollinations",
      model: "flux",
      success: data.success,
      errorMessage: data.errorMessage ?? null,
    });
    return { ok: true };
  });
