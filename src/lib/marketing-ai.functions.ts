import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforceQuota, recordAiUsage } from "./ai-access.server";
import { buildServiceContext, buildKnowledgeBlock } from "./digiformation-knowledge";
import { buildMarketingAssetContext } from "./knowledge";
import { buildMarketingAssetPrompt } from "./knowledge/serialize";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Marketing AI — server-side Lovable AI Gateway (Gemini) calls.
// Returns structured JSON to the client for each Marketing Tool.
// ============================================================================

const MODEL = "google/gemini-2.5-flash";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Tone = "professional" | "corporate" | "friendly" | "sales" | "urgent";
type Platform = "facebook" | "instagram" | "linkedin" | "whatsapp";

export type MarketingInput =
  | {
      tool: "ad_copy";
      service: string;
      audience: string;
      tone: Tone;
    }
  | {
      tool: "caption";
      service: string;
      platform: Platform;
    }
  | {
      tool: "hashtags";
      service: string;
      platform: Platform;
    }
  | {
      tool: "content_pack";
      service: string;
      audience: string;
      tone: Tone;
      platform: Platform;
    }
  | {
      tool: "whatsapp";
      service: string;
      client_name?: string;
    };

export type MarketingOutput =
  | { tool: "ad_copy"; short: string; medium: string; long: string }
  | { tool: "caption"; captions: string[] }
  | {
      tool: "hashtags";
      general: string[];
      industry: string[];
      high_reach: string[];
      niche: string[];
    }
  | {
      tool: "content_pack";
      ad_copy: { short: string; medium: string; long: string };
      caption: string;
      hashtags: string[];
      ctas: string[];
    }
  | {
      tool: "whatsapp";
      initial: string;
      follow_up: string;
      reminder: string;
    };

async function buildPrompt(
  input: MarketingInput,
  supabase: SupabaseClient,
  userId: string,
): Promise<{ system: string; user: string }> {
  const platform = (input as { platform?: Platform }).platform;
  let dbBlock: string | null = null;
  try {
    const ctx = await buildMarketingAssetContext({
      // Service comes by name not slug; if the slug lookup misses, the builder
      // returns an empty service context that still includes global angles/kw.
      serviceSlug: (input as { service?: string }).service,
      partnerId: userId,
      client: supabase,
    });
    dbBlock = buildMarketingAssetPrompt(ctx, platform);
  } catch (err) {
    console.warn("[marketing-ai] knowledge context failed, using legacy block", err);
  }
  const fallback = `${buildKnowledgeBlock()}\n\nACTIVE SERVICE CONTEXT:\n${buildServiceContext((input as { service?: string }).service)}`;
  const knowledge = dbBlock ?? fallback;
  const system =
    `You are the in-house DigiFormation marketing copywriter. Use ONLY the DigiFormation knowledge base and the specific service context provided — never invent services, prices, or partners. If a price is missing, write exactly: "Contact DigiFormation for pricing". Always respond with ONLY a valid JSON object, no markdown fences, no commentary.

${knowledge}`;



  switch (input.tool) {
    case "ad_copy":
      return {
        system,
        user: `Write ad copy for the DigiFormation service "${input.service}".
Target audience: ${input.audience || "small business owners and entrepreneurs"}.
Tone: ${input.tone}.
Return JSON with exactly these keys:
{
  "short": "ad copy under 90 characters, punchy hook",
  "medium": "ad copy 150-220 characters with a hook + benefit + CTA",
  "long": "ad copy 350-500 characters with hook, 2-3 benefits, social proof element, and clear CTA"
}`,
      };
    case "caption":
      return {
        system,
        user: `Write 3 social media caption variations for the DigiFormation service "${input.service}" optimised for ${input.platform}.
Each caption must match ${input.platform}'s style and length norms, include relevant emoji where appropriate, and end with a clear CTA.
Return JSON: { "captions": ["variation 1", "variation 2", "variation 3"] }`,
      };
    case "hashtags":
      return {
        system,
        user: `Generate hashtags for the DigiFormation service "${input.service}" on ${input.platform}.
Group them into 4 categories. Return JSON with exactly these arrays of hashtags (each starting with #):
{
  "general": ["6-8 broadly relevant tags"],
  "industry": ["6-8 industry-specific tags (UK business, formation, finance)"],
  "high_reach": ["5-7 large-volume tags"],
  "niche": ["5-7 narrow, lower-volume tags with focused intent"]
}
Total 22-30 hashtags. No duplicates.`,
      };
    case "content_pack":
      return {
        system,
        user: `Create a complete marketing content pack for the DigiFormation service "${input.service}".
Audience: ${input.audience || "UK SMEs and entrepreneurs"}. Tone: ${input.tone}. Primary platform: ${input.platform}.
Return JSON:
{
  "ad_copy": { "short": "<90 chars", "medium": "150-220 chars", "long": "350-500 chars" },
  "caption": "one scroll-stopping ${input.platform} caption with CTA",
  "hashtags": ["array of 15-20 mixed reach + niche hashtags, each starting with #"],
  "ctas": ["4 short, distinct call-to-action lines suitable for buttons or end-of-post"]
}`,
      };
    case "whatsapp":
      return {
        system,
        user: `Write three WhatsApp messages from a DigiFormation partner to a prospect interested in "${input.service}".
${input.client_name ? `Use the client's first name "${input.client_name}".` : "Use a friendly generic greeting."}
Messages must be concise, conversational, mobile-friendly, with light emoji.
Return JSON:
{
  "initial": "first-contact message introducing the service and asking how to help",
  "follow_up": "a polite follow-up 2-3 days later checking in",
  "reminder": "a final warm reminder offering to answer questions or book a call"
}`,
      };
  }
}

export const generateMarketing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => input as MarketingInput)
  .handler(async ({ data, context }): Promise<MarketingOutput> => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Per-day quota: free=10, premium=100, admin=unlimited.
    await enforceQuota(supabase, userId, "marketing");

    const { system, user } = await buildPrompt(data, supabase, userId);

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: "lovable_gateway",
        model: `${MODEL}:${data.tool}`,
        success: false,
        errorMessage: `marketing:${res.status}`,
      });
      if (res.status === 429) {
        throw new Error("AI rate limit reached. Please try again in a moment.");
      }
      if (res.status === 402) {
        throw new Error("AI credits exhausted. Please add credits in workspace settings.");
      }
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: Record<string, unknown>;
    try {
      const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: "lovable_gateway",
        model: `${MODEL}:${data.tool}`,
        success: false,
        errorMessage: "malformed_json",
      });
      throw new Error("AI returned malformed JSON. Please try again.");
    }

    await recordAiUsage(supabase, {
      partnerId: userId,
      provider: "lovable_gateway",
      model: `${MODEL}:${data.tool}`,
      success: true,
    });
    return { tool: data.tool, ...parsed } as MarketingOutput;
  });
