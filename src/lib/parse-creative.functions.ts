import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CREATIVE_CATEGORIES } from "@/lib/creative-categories";

// =============================================================================
// Parse a master marketing message into structured creative fields.
// Admin uploads ONE image + ONE master message; AI derives title / category /
// service / caption / cta / hashtags so we never ask the admin to split it.
// =============================================================================

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

type Input = { masterMessage: string };

export type ParsedCreative = {
  title: string;
  service_name: string;
  category: string;
  caption: string;
  cta: string;
  hashtags: string[];
};

export const parseMasterMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as Partial<Input>;
    if (!i?.masterMessage || typeof i.masterMessage !== "string") {
      throw new Error("Missing master message");
    }
    if (i.masterMessage.trim().length < 10) throw new Error("Message too short");
    return { masterMessage: i.masterMessage };
  })
  .handler(async ({ data }): Promise<ParsedCreative> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    const categories = CREATIVE_CATEGORIES.join(" | ");
    const system = `You are an extraction engine for a marketing CMS. Given a master marketing message, return ONLY a JSON object with the exact keys: title, service_name, category, caption, cta, hashtags. category MUST be one of: ${categories}. hashtags is an array of strings each starting with #. Never include markdown fences.`;
    const user = `Master message:\n\n${data.masterMessage}\n\nReturn JSON:\n{\n  "title": "short SEO title under 60 chars",\n  "service_name": "specific DigiFormation service name referenced (e.g. UK Ltd Formation, Stripe Setup)",\n  "category": "one of the allowed categories",\n  "caption": "clean marketing caption body (the message minus contact lines and hashtags)",\n  "cta": "the call to action line",\n  "hashtags": ["#tag1", ...]\n}`;

    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`Parse failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const j = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
    const content = (j.choices?.[0]?.message?.content ?? "{}").trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const p = JSON.parse(content) as Partial<ParsedCreative>;
    const allowed = new Set<string>(CREATIVE_CATEGORIES as readonly string[]);
    const category = p.category && allowed.has(p.category) ? p.category : "UK LTD Formation";
    return {
      title: (p.title ?? "").trim() || "Untitled creative",
      service_name: (p.service_name ?? "").trim(),
      category,
      caption: (p.caption ?? "").trim(),
      cta: (p.cta ?? "").trim(),
      hashtags: Array.isArray(p.hashtags)
        ? p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).filter(Boolean)
        : [],
    };
  });
