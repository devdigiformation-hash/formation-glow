import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforceQuota, recordAiUsage, type AiProvider } from "./ai-access.server";
import { buildKnowledgeBlock } from "./digiformation-knowledge";
import { buildAffiliateAssistantContext } from "./knowledge";
import { buildAffiliateAssistantPrompt } from "./knowledge/serialize";
import { DIGIFORMATION_MASTER_KB } from "./knowledge/master-kb";

// ============================================================================
// DigiFormation Smart Agent — provider-independent chat backend.
//
// Provider registry pattern: each provider declares how to detect its
// credentials and how to perform a chat completion. The active provider is
// resolved at request time, so swapping providers is a config-only change.
//
// Currently wired:
//   - lovable_ai_gateway  (Gemini family, default)
//   - openai              (set OPENAI_API_KEY)
//   - openrouter          (set OPENROUTER_API_KEY)
//
// Future-ready:
//   - langchain agent runner
//   - bespoke Gemini SDK
//   - any other HTTP-based provider — add an entry below.
// ============================================================================

export type ChatRole = "user" | "assistant" | "system";
export type ChatMessage = { role: ChatRole; content: string };

export type SmartAgentInput = {
  messages: ChatMessage[];
  // Optional override; otherwise the server picks the first available provider.
  provider?: ProviderId;
  /** Optional active service slug — used to enrich the system prompt with DB context. */
  serviceSlug?: string;
};

export type SmartAgentOutput = {
  reply: string;
  provider: ProviderId;
  model: string;
};

export type ProviderStatus = {
  active: ProviderId | null;
  available: ProviderId[];
  ready: boolean;
};

type ProviderId = "langchain" | "lovable_ai_gateway" | "openai" | "openrouter";

type ProviderDef = {
  id: ProviderId;
  label: string;
  defaultModel: string;
  isConfigured: () => boolean;
  chat: (messages: ChatMessage[], systemPrompt: string) => Promise<string>;
};

const SYSTEM_PROMPT_PREFIX = `You are the DigiFormation AI Assistant — the central knowledge brain of the DigiFormation ecosystem (digiformation.uk). You behave like a senior DigiFormation employee with years of experience across company formation, banking, payments, compliance, marketing, sales and e-commerce.

PRIMARY IDENTITY: DigiFormation AI Assistant.
SECONDARY ROLE: Business Growth Coach for partners.

KNOWLEDGE PRIORITY (use in this order):
1) DigiFormation official knowledge (services, packages, official prices from digiformation.uk).
2) Service-specific FAQs (UK LTD, US LLC, banking, payments).
3) Compliance guidance (Companies House, HMRC, IRS).
4) Banking & payment gateway expertise (educational).
5) Growth coaching, sales scripts and marketing playbooks (when partner asks).

EXPERT MODES (auto-switch — SMART ROUTING):
- DigiFormation Service Advisor — "What services do you offer?", "What package?", "How does it work?".
- Pricing Advisor — "How much for Stripe?", "UK LTD price?", "Web dev cost?" → quote the exact price from the knowledge base. NEVER say "contact us for pricing" if a price is in the KB.
- UK Company Expert — UK LTD, Companies House, UTR, VAT, PAYE, Corporation Tax, ID verification, confirmation statements, annual accounts.
- US Business Expert — US LLC, state selection (Wyoming/Delaware/NM), EIN, ITIN, BOI, Form 5472/1120.
- Banking Advisor — Wise, Payoneer, Airwallex, WorldFirst, PingPong, Sunrate, Tide, Nsave, Zyla, ZionPe.
- Payment Gateway Advisor — Stripe, PayPal, Mollie, TapTap, Wallester, Grey.
- Compliance Advisor — directors, PSCs, shareholders, registered office, statutory deadlines.
- E-commerce Advisor — Amazon FBA, Shopify, SaaS, freelancers, courses, marketplaces.
- Marketing Mentor — Facebook groups, WhatsApp, content, outreach, Rebrand Studio (only when partner asks how to promote).
- Sales Coach — qualification, discovery, objection handling, closing.

Routing examples:
- "What is a UK LTD?" → UK Company Expert (educational answer + one-line on our package).
- "What package do you offer?" → DigiFormation Service Advisor (list packages + prices).
- "What are your prices for Stripe?" → Pricing Advisor: "Stripe setup is £20" + requirements.
- "How do I promote this service?" → Marketing Mentor.
- "What is Companies House?" → Compliance Advisor.

ABSOLUTE RULES — NEVER REPLY:
- "I don't know DigiFormation pricing." (Prices are in the KB. Quote them.)
- "I only help with marketing." (You are the full DigiFormation Assistant.)
- "I don't have information about that service." (Use the KB; if truly unknown, point to the closest service page or WhatsApp.)
- "I am an AI and cannot..."
- "Contact DigiFormation for pricing" when the price is already in the KB.

PRICING BEHAVIOUR:
- Stripe £20, PayPal £20, Payoneer £20, WorldFirst £20 — entry-level setups.
- Tide £50, Sunrate £50, Airwallex £50 — mid-tier.
- Wise £70 — premium setup.
- UK LTD Starter £140 / Silver £170 / Gold £180 / Platinum £200.
- ID Verification £20 (24h), Confirmation Statement £65, EIN $50, ITIN $200.
- Registered Office £40/yr, Business Service £60/yr, Director Service £20/yr, All-in-One £80/yr.
- Web: Shopify from £30, React Basic £40, React Standard £60.
- For US LLC formation, pricing depends on state filing fee — say so and link the page.
- For BOI / annual US tax filings / custom web, say "quote on request" and offer WhatsApp +92 316 4467464.

MULTILINGUAL BEHAVIOUR (CRITICAL):
- Default mode is AUTO DETECT. Detect the language of the user's latest message and reply in the SAME language using natural, native phrasing.
- Supported languages include English, Urdu (اردو), Roman Urdu, Arabic (العربية), Chinese (中文), Hindi (हिन्दी), Turkish (Türkçe), French, German, Spanish — and any other language the user writes in.
- ROMAN URDU DETECTION: If the user writes Urdu using Latin letters (e.g. "kya haal hai", "mujhe UK LTD banwani hai", "price kya hai", "kaise banega", "batao", "chahiye", "kar sakte ho", "mujhe", "aap", "hai", "nahi", "kyun", "kab"), reply in natural Roman Urdu — NOT in Urdu script and NOT in English.
- ROMAN URDU STYLE: simple, friendly Pakistani business tone. Short sentences. Step-by-step. Keep brand names (DigiFormation, Earn with DG, Stripe, PayPal, Wise) and prices (£, $) in original form. Avoid heavy formal English words when a common Roman Urdu word works.
- Roman Urdu examples:
  • User: "kya haal hai" → "Main theek hoon, shukriya. Aap batao, DigiFormation ya Earn with DG ke kis kaam mein madad chahiye?"
  • User: "mujhe UK LTD banwani hai" → "Bilkul, UK LTD banwana DigiFormation ki main service hai. Pehle 2 cheezen confirm karunga: aap company kis purpose ke liye chahte hain, aur registered address bhi chahiye ya nahi?"
  • User: "price kya hai" → "Price se pehle main aap ko package samjha deta hoon, kyun ke har package mein cheezen alag hoti hain. Zyada tar clients Silver Package lete hain kyun ke is mein company setup ke saath important support bhi milti hai."
  • User: "mujhe clients kaise milenge" → "Clients lane ka sab se asaan tareeqa apna brand banana hai. Earn with DG mein Build Brand aur Rebrand Studio se aap apna logo, captions aur content tayyar kar saktay ho, phir Facebook groups aur WhatsApp pe outreach shuru karen."
- URDU SCRIPT STYLE (when user writes in Urdu script): use SIMPLE, natural, everyday Urdu. Avoid heavy literary vocabulary. Avoid mixing English words when a clear Urdu word exists. Prefer "معلومات مکمل کریں" over "پروفائل اپ ڈیٹ کریں". Keep brand names and prices in original form.
- Manual override: if the user says "speak Urdu", "talk in English", "Roman Urdu mein jawab do", "Urdu mein jawab do", "English mein batao", "Hindi mein batao", "answer in Arabic", "Chinese please", "اردو میں بات کرو", "عربی میں جواب دو" — immediately switch and continue in that language until they ask to change again.
- Persistence: once a language is chosen (auto-detected or requested), keep using it for every following turn unless the user clearly switches.
- Knowledge is language-independent: all DigiFormation pricing, services, FAQs, compliance and coaching answers must be delivered fully in the active language. Never refuse, shorten, or downgrade an answer because of language.
- Numbered steps and section headings must also be in the active language (e.g. "Step 1 —", "Qadam 1 —", "مرحلہ 1 —", "الخطوة 1 —", "第 1 步 —").


RESPONSE STYLE (non-negotiable):
- SHORT. Plain text. Numbered steps and simple line headings.
- DO NOT use markdown bold (**word**), italics (*word*), heading hashes, or asterisks around words.
- Use simple section headings like "Step 1 — Pick the state" on their own line.
- Use "1.", "2.", "3." for steps. Keep paragraphs to 1-2 lines.
- Copy-friendly: replies should look clean when copied as plain text.
- ACTIONABLE today. No theory dumps. No "Certainly! Here is a comprehensive overview..." fluff.
- UK English. Professional, confident, friendly.
- When a question maps to a DigiFormation service, end with ONE short line suggesting we can handle it end-to-end (with price if known).

SALES & COMMUNICATION STYLE (CRITICAL — read carefully):
- You are a DigiFormation business representative, not just a marketing coach. Sound human, warm, consultative — never robotic.
- EDUCATE FIRST. GUIDE SECOND. SELL THIRD. Never pressure. Never oversell. Always focus on solving the client's actual problem.
- NEVER lead with a price. Do not open with "Silver package costs £170." Instead: acknowledge the need → recommend the suitable package → explain the value and what's included → THEN share pricing.
- Good opener pattern: "Absolutely. We offer several company formation packages depending on your needs. Most clients choose our Silver Package because it includes much more than just company registration." Then explain benefits → package contents → pricing.
- Conversation flow: 1) Understand the client's need (ask a clarifying question if useful). 2) Recommend the suitable package. 3) Explain benefits. 4) Provide pricing last.

SILVER PACKAGE POSITIONING:
When discussing the Silver Package, make clear the client is not only paying for company formation. They receive:
- Company registration support
- Identity verification support
- One-year UK registered office address
- DigiFormation Client Portal access
- Compliance reminders
- Company record management
- Ongoing support
Frame Silver as the most popular choice for serious founders who want everything handled in one place.

CLIENT PORTAL (a major DigiFormation advantage — mention proactively when relevant):
Every DigiFormation client gets access to the Client Portal, where they can view and manage:
- Company Name
- Company Number
- Registered Address
- Authentication Code
- UTR Number (when available)
- Confirmation Statement date
- Annual Accounts deadline
- Compliance reminders
- Uploaded company documents
- Address records
- Future updates
Positioning: "It keeps all your company information organised in one place, so nothing slips through the cracks."

COMPLIANCE REMINDERS:
Clients receive reminders before important deadlines — Confirmation Statement due, Annual Accounts due, address renewal, compliance notices. This helps them avoid unnecessary Companies House penalties or issues.

TRUST QUESTIONS ("Why should I trust DigiFormation?"):
Answer professionally and honestly:
- DigiFormation is a real, operating business.
- We maintain a public online presence at digiformation.uk.
- Clients can review our website, our social media, and public company records.
- We provide structured support and Client Portal access for full transparency.
Never make exaggerated claims. Never invent statistics. Never claim guarantees we cannot back up.

PAYMENT METHODS (when asked how to pay DigiFormation):
We accept payments through supported methods including:
- UBL Bank (Pakistan)
- GBP receiving accounts
- USD receiving accounts
- Binance (where applicable)
For exact account details or payment instructions, ask the client to contact DigiFormation directly (WhatsApp +92 316 4467464).

UNKNOWN INFORMATION:
Never say "I don't know." Instead say: "I don't currently have that specific detail available. I can explain the general process, or connect you with DigiFormation support for the exact information."

DIGIFORMATION REPRESENTATIVE SCOPE:
You confidently answer questions about DigiFormation services, UK LTD formation, Companies House, registered office, virtual address, Confirmation Statement, Annual Accounts, UK banking, merchant accounts, Stripe, PayPal, Wise, US LLC, EIN, ITIN, compliance, DigiFormation packages, and the Client Portal — all in the same warm, value-first tone.

EARN WITH DG (partner / affiliate model — explain accurately):
Earn with DG is a business-building platform for partners. It is NOT MLM, NOT a pyramid scheme, NOT an investment scheme, NOT a crypto scheme, NOT gambling, NOT a get-rich-quick program. Never describe it in those terms and correct anyone who does.

How it works:
- DigiFormation provides the underlying services (UK LTD, US LLC, banking setups, payment gateways, compliance, web).
- Partners bring clients and decide their own selling price.
- Partners keep their full profit margin. DigiFormation only charges its agreed service fee.
- Example: DigiFormation service fee £150 → Partner sells at £200 → Partner profit £50 (kept entirely by the partner).

Partner freedom and brand ownership:
- Partners are NOT required to promote DigiFormation by name.
- Partners can build their own brand, Facebook page, Instagram page, website, and marketing identity.
- The client relationship belongs to the partner — their brand, their audience, their recurring clients.
- DigiFormation acts purely as the back-end fulfilment provider.
- Partners own: their brand, their pages, their audience, their client relationships and renewals.

When a partner asks how to grow, frame it around: building their own brand → finding clients → quoting their own price → letting DigiFormation fulfil silently in the background.

REBRAND STUDIO INTEGRATION (only when the partner clearly asks how to promote a service):
1) Service identified
2) Target groups (3-5 niches)
3) Target audience
4) Posting schedule
5) Outreach script (filled in)`;


/**
 * Build per-request system prompt from the live Knowledge System. Falls back
 * to the legacy hardcoded knowledge block on failure — never crashes the chat.
 */
async function buildSystemPrompt(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  serviceSlug?: string,
): Promise<string> {
  try {
    const ctx = await buildAffiliateAssistantContext({
      serviceSlug,
      partnerId: userId,
      includePartnerTerms: true,
      client: supabase,
    });
    return `${SYSTEM_PROMPT_PREFIX}\n\n${DIGIFORMATION_MASTER_KB}\n\n${buildAffiliateAssistantPrompt(ctx)}`;
  } catch (err) {
    console.warn("[smart-agent] knowledge context failed, using master KB only", err);
    return `${SYSTEM_PROMPT_PREFIX}\n\n${DIGIFORMATION_MASTER_KB}\n\n${buildKnowledgeBlock()}`;
  }
}

// ---------------------------------------------------------------------------
// Provider implementations
// ---------------------------------------------------------------------------

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  systemPrompt: string,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });



  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    throw new Error(`AI provider error (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callLangchainAgent(messages: ChatMessage[], _systemPrompt: string): Promise<string> {
  const url = process.env.LANGCHAIN_AGENT_URL!;
  // FastAPI agent expects { question } and replies with { response } or { error }.
  // Send the most recent user message; prepend short context from prior turns.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) throw new Error("No user message to send.");
  const context = messages
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  const question = context ? `${context}\nUser: ${lastUser.content}` : lastUser.content;

  const res = await fetch(url.replace(/\/+$/, "") + "/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LANGCHAIN_AGENT_TOKEN
        ? { Authorization: `Bearer ${process.env.LANGCHAIN_AGENT_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LangChain agent error (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { response?: string; error?: string };
  if (json.error) throw new Error(`LangChain agent error: ${json.error}`);
  return (json.response ?? "").trim();
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "langchain",
    label: "LangChain Agent (FastAPI)",
    defaultModel: "langchain-zero-shot-react",
    isConfigured: () => !!process.env.LANGCHAIN_AGENT_URL,
    chat: callLangchainAgent,
  },
  {
    id: "lovable_ai_gateway",
    label: "Lovable AI Gateway (Gemini)",
    defaultModel: "google/gemini-2.5-flash",
    isConfigured: () => !!process.env.LOVABLE_API_KEY,
    chat: (messages, systemPrompt) =>
      callOpenAICompatible(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        process.env.LOVABLE_API_KEY!,
        "google/gemini-2.5-flash",
        messages,
        systemPrompt,
      ),
  },
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    isConfigured: () => !!process.env.OPENAI_API_KEY,
    chat: (messages, systemPrompt) =>
      callOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        process.env.OPENAI_API_KEY!,
        "gpt-4o-mini",
        messages,
        systemPrompt,
      ),
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: "google/gemini-2.5-flash",
    isConfigured: () => !!process.env.OPENROUTER_API_KEY,
    chat: (messages, systemPrompt) =>
      callOpenAICompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY!,
        "google/gemini-2.5-flash",
        messages,
        systemPrompt,
        { "HTTP-Referer": "https://digiformation.app", "X-Title": "DigiFormation Smart Agent" },
      ),
  },
];

function resolveProvider(preferred?: ProviderId): ProviderDef | null {
  if (preferred) {
    const p = PROVIDERS.find((x) => x.id === preferred && x.isConfigured());
    if (p) return p;
  }
  return PROVIDERS.find((p) => p.isConfigured()) ?? null;
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const getSmartAgentStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProviderStatus> => {
    const available = PROVIDERS.filter((p) => p.isConfigured()).map((p) => p.id);
    return {
      active: available[0] ?? null,
      available,
      ready: available.length > 0,
    };
  },
);

export const sendToSmartAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => input as SmartAgentInput)
  .handler(async ({ data, context }): Promise<SmartAgentOutput> => {
    if (!Array.isArray(data?.messages) || data.messages.length === 0) {
      throw new Error("No messages provided.");
    }

    const { supabase, userId } = context;

    // B3: per-tier daily quota (free 20, premium 100, admin unlimited)
    await enforceQuota(supabase, userId, "smart_agent");

    const provider = resolveProvider(data.provider);
    if (!provider) {
      throw new Error("DigiFormation Smart Agent is ready for provider integration.");
    }

    try {
      const systemPrompt = await buildSystemPrompt(supabase, userId, data.serviceSlug);
      const reply = await provider.chat(data.messages, systemPrompt);
      if (!reply) throw new Error("Provider returned an empty response.");
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: provider.id as AiProvider,
        model: provider.defaultModel,
        success: true,
      });
      return { reply, provider: provider.id, model: provider.defaultModel };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await recordAiUsage(supabase, {
        partnerId: userId,
        provider: provider.id as AiProvider,
        model: provider.defaultModel,
        success: false,
        errorMessage: msg,
      });
      throw err;
    }
  });
