// KD.3 — Sales & Closing Knowledge.
// Reusable DM / WhatsApp / follow-up / re-engagement / closing scripts plus
// a full objection-handling library. Bilingual-friendly: English baseline
// with Roman-Urdu accents where natural.

export type ScriptLength = "short" | "medium" | "long";
export type ScriptChannel =
  | "facebook_dm"
  | "whatsapp"
  | "follow_up"
  | "re_engagement"
  | "closing";

export interface SalesScript {
  service: string; // slug
  channel: ScriptChannel;
  short: string;
  medium: string;
  long: string;
}

// ---------- helpers ----------
const S = (s: SalesScript) => s;

// Reusable templates. `{name}` and `{service}` are replaced at runtime.
export const TEMPLATE_TOKENS = ["{name}", "{service}", "{benefit}", "{offer}", "{next_step}"] as const;

export function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

// ---------- generic reusable templates ----------
export const GENERIC_TEMPLATES: Record<ScriptChannel, Record<ScriptLength, string>> = {
  facebook_dm: {
    short: "Hi {name}, saw your post about {benefit}. We help with {service} — want details?",
    medium:
      "Hi {name}, I noticed your post about {benefit}. We help founders like you with {service} — fast, fully remote. Happy to share a 1-pager if useful?",
    long:
      "Hi {name}, hope you're well. I came across your post about {benefit} and wanted to reach out. We help founders set up {service} end-to-end — remote, transparent pricing, and we handle the paperwork so you don't have to. If you'd like, I can share a short guide and a price list. No pressure — just here if it's useful.",
  },
  whatsapp: {
    short: "Salam {name} 👋 Quick one — interested in {service}? Can share full info.",
    medium:
      "Salam {name} 👋 Hope you're well. We help with {service} — 100% remote, full support. Want me to send pricing and a quick guide?",
    long:
      "Salam {name} 👋 Hope all is good. We help founders and freelancers set up {service} — fully remote, end-to-end support. Many of our clients get sorted in days. If you want, I can send you the pricing, a short guide, and answer any questions you have. Whenever you're free.",
  },
  follow_up: {
    short: "Hey {name}, just checking in on {service}. Any questions?",
    medium:
      "Hey {name}, following up on {service}. Wanted to see if you had any questions or if I can help with anything specific. Happy to jump on a quick call.",
    long:
      "Hey {name}, hope this week is going well. Just following up on our chat about {service}. I know these decisions take time. If there's anything specific you'd like me to clarify — pricing, process, timeline, or risks — just let me know and I'll send it across. No rush.",
  },
  re_engagement: {
    short: "Hi {name}, still thinking about {service}? New offer this week.",
    medium:
      "Hi {name}, it's been a while. We just rolled out {offer} for {service} — thought of you. Want details?",
    long:
      "Hi {name}, hope you're doing well. Wanted to reach back out — we just launched {offer} for {service} and remembered you were exploring this. If timing is better now, I'd love to help. If not, totally fine — just wanted to keep you in the loop.",
  },
  closing: {
    short: "Ready to start {service}? I'll send the link.",
    medium:
      "Sounds like {service} is a great fit. Want me to send the secure payment link and start your setup today?",
    long:
      "Based on what you've shared, {service} looks like the right move for you. Here's what happens next: I send you a secure payment link, you complete it in 2 minutes, and we kick off your setup the same day. Shall I send the link?",
  },
};

// ---------- per-service scripts ----------
// Each service has 5 script channels × 3 lengths = 15 ready-to-use messages.
// Tone: warm, founder-to-founder, English with light Roman-Urdu where natural.

const make = (
  service: string,
  perChannel: Record<ScriptChannel, { short: string; medium: string; long: string }>,
): SalesScript[] =>
  (Object.keys(perChannel) as ScriptChannel[]).map((channel) =>
    S({ service, channel, ...perChannel[channel] }),
  );

export const SALES_SCRIPTS: SalesScript[] = [
  ...make("uk-ltd", {
    facebook_dm: {
      short: "Hi {name}, want a UK LTD set up in 48h? Fully remote.",
      medium:
        "Hi {name}, saw you work with Western clients. A UK LTD unlocks Stripe, Wise, and Amazon UK — 48h setup, fully remote. Want details?",
      long:
        "Hi {name}, came across your profile — looks like you work with Western clients. A UK LTD is the single biggest credibility upgrade for freelancers and agencies: Stripe, Wise, Amazon UK, and serious B2B clients all open up. We handle the entire incorporation in 48 hours, fully remote, no UK visit. Happy to send pricing and a short guide if useful.",
    },
    whatsapp: {
      short: "Salam {name} 👋 UK LTD in 48h, fully remote — interested?",
      medium:
        "Salam {name} 👋 Hope you're well. UK LTD setup in 48 hours, fully remote — opens Stripe, Wise, Amazon UK. Want me to send pricing?",
      long:
        "Salam {name} 👋 Hope you're doing well. Quick note — we set up UK LTDs in 48 hours, fully remote. It instantly unlocks Stripe, Wise, and serious Western clients. Many of our partners say it changed their pricing power overnight. Want me to send pricing and a 1-page guide?",
    },
    follow_up: {
      short: "Hey {name}, any questions on the UK LTD info I sent?",
      medium:
        "Hey {name}, following up on the UK LTD info. Want me to walk you through the steps on a 10-min call?",
      long:
        "Hey {name}, hope the week's been good. Just following up on the UK LTD info I shared. I know it's a real decision — if you'd like, I can jump on a 10-minute call and walk you through the process, costs, and timing so it's crystal clear. No pressure either way.",
    },
    re_engagement: {
      short: "Hi {name}, new UK LTD bundle this week — interested?",
      medium:
        "Hi {name}, we just rolled out a UK LTD + Wise bundle this week. Thought of you — want details?",
      long:
        "Hi {name}, hope you're doing well. Wanted to reach back out — we just launched a UK LTD + Wise + Address bundle and remembered you were exploring this. If timing is better now, I'd love to help you get it sorted. If not, no worries.",
    },
    closing: {
      short: "Ready to start your UK LTD? Sending the link.",
      medium:
        "UK LTD sounds like the right move. Want me to send the secure payment link and start setup today?",
      long:
        "Based on what you've shared, a UK LTD is the right move. Here's the plan: I send you the secure payment link, you pay in 2 minutes, and we file with Companies House the same day. You'll have your certificate in 24-48 hours. Shall I send the link?",
    },
  }),
  ...make("us-llc", {
    facebook_dm: {
      short: "Hi {name}, want a US LLC + EIN bundle? Fully remote.",
      medium:
        "Hi {name}, US LLC unlocks Stripe US, PayPal US, Amazon US — 5 day setup, fully remote. Want a bundle quote?",
      long:
        "Hi {name}, saw your post about US clients. A US LLC + EIN unlocks Stripe US, PayPal US, and Amazon US — fully remote, around 5 business days. We handle state filing, EIN, and operating agreement. Want me to send the bundle pricing?",
    },
    whatsapp: {
      short: "Salam {name} 👋 US LLC + EIN bundle — interested?",
      medium:
        "Salam {name} 👋 US LLC + EIN in about a week, fully remote. Stripe US + PayPal US become possible. Want details?",
      long:
        "Salam {name} 👋 Hope all is well. We set up US LLCs + EIN as a bundle — fully remote, takes about a week, and unlocks Stripe US and PayPal US which most founders here can't access otherwise. Want me to send pricing and a quick guide?",
    },
    follow_up: {
      short: "Hey {name}, any questions on the US LLC info?",
      medium:
        "Hey {name}, following up on the US LLC + EIN bundle. Happy to clarify state choice, tax, or timing.",
      long:
        "Hey {name}, hope the week's been good. Following up on the US LLC + EIN info. State choice and US tax are the two things that worry most founders — happy to clear both up on a quick call or in writing, whichever you prefer.",
    },
    re_engagement: {
      short: "Hi {name}, US LLC + EIN + Mercury bundle live this week.",
      medium:
        "Hi {name}, we just launched a US LLC + EIN + bank-intro bundle this week. Want details?",
      long:
        "Hi {name}, hope you're well. Wanted to reach back out — we just launched a US LLC + EIN + bank-intro bundle and you were exploring this earlier. If timing's better now, happy to walk you through it.",
    },
    closing: {
      short: "Ready to start your US LLC? Sending the link.",
      medium:
        "Sounds like a US LLC + EIN is right for you. Want me to send the secure payment link and start today?",
      long:
        "Based on your goals (Stripe US + US clients), the US LLC + EIN bundle is the right move. Here's the plan: I send the secure payment link, you pay in 2 minutes, we file the same day, EIN follows. Shall I send the link?",
    },
  }),
  ...make("ein", {
    facebook_dm: {
      short: "Hi {name}, need an EIN for your US LLC? No SSN required.",
      medium:
        "Hi {name}, EIN is what unlocks Stripe US and PayPal US. We get it done for non-US founders — no SSN needed. Want help?",
      long:
        "Hi {name}, noticed you have a US LLC. Without an EIN you can't open Stripe US, PayPal US, or a US bank — and it's the #1 thing founders miss. We handle the IRS application for non-US founders end-to-end. Want me to send pricing and timing?",
    },
    whatsapp: {
      short: "Salam {name} 👋 EIN for your US LLC — want help?",
      medium:
        "Salam {name} 👋 EIN unlocks Stripe US + PayPal US. No SSN required. Want me to handle the IRS application?",
      long:
        "Salam {name} 👋 Hope all good. Quick one — if you have a US LLC, the EIN is what unlocks Stripe US, PayPal US, and US banks. We handle the IRS application for non-US founders, no SSN required. Want me to share pricing and timing?",
    },
    follow_up: {
      short: "Hey {name}, want me to start your EIN application?",
      medium:
        "Hey {name}, following up on the EIN. Happy to clarify IRS timing — usually 1-4 weeks.",
      long:
        "Hey {name}, hope you're well. Following up on the EIN. I know IRS timing scares people — typically 1-4 weeks, and we follow up so you don't have to chase. Want me to get started?",
    },
    re_engagement: {
      short: "Hi {name}, EIN turnaround is faster this month.",
      medium:
        "Hi {name}, IRS is moving faster on EIN this month — good time to apply. Want me to handle it?",
      long:
        "Hi {name}, hope you're well. Quick update — IRS is processing EIN applications faster this month. If you've been waiting, now is a good window. Want me to handle the application for you?",
    },
    closing: {
      short: "Ready to start your EIN? Sending the link.",
      medium:
        "Let's get your EIN started. Want me to send the secure payment link?",
      long:
        "Let's get your EIN sorted so Stripe US and PayPal US become possible. I'll send the secure payment link, you pay in 2 minutes, and I'll start the IRS application the same day. Shall I send the link?",
    },
  }),
  ...make("itin", {
    facebook_dm: {
      short: "Hi {name}, lose 30% to Amazon withholding? Get an ITIN.",
      medium:
        "Hi {name}, Amazon and royalty payers withhold 30% from non-US authors. An ITIN + treaty lets you keep more. Want help?",
      long:
        "Hi {name}, saw you publish on Amazon. Most non-US authors lose 30% of royalties to default withholding — an ITIN plus the US-Pakistan tax treaty drops that significantly. We handle ITIN end-to-end for non-US founders. Want me to send pricing?",
    },
    whatsapp: {
      short: "Salam {name} 👋 Amazon takes 30%? ITIN can fix it.",
      medium:
        "Salam {name} 👋 If Amazon or royalty payers withhold 30% from you, an ITIN + treaty fixes that. Want help?",
      long:
        "Salam {name} 👋 Hope you're well. Quick one — if you earn on Amazon KDP or any US royalty platform, they keep 30% by default. With an ITIN and the right treaty form, that drops a lot. We handle the IRS application. Want details?",
    },
    follow_up: {
      short: "Hey {name}, any questions on the ITIN application?",
      medium:
        "Hey {name}, following up on the ITIN. IRS takes 8-14 weeks — better to start early. Want me to start?",
      long:
        "Hey {name}, hope you're good. Following up on the ITIN. IRS typically takes 8-14 weeks so the earlier we start, the sooner you stop losing 30%. Want me to begin?",
    },
    re_engagement: {
      short: "Hi {name}, ITIN still open if you want to stop the 30% loss.",
      medium:
        "Hi {name}, just a reminder — every month without an ITIN is 30% gone from your royalties. Want me to start?",
      long:
        "Hi {name}, hope you're well. Just a nudge — every month you don't have an ITIN, you lose 30% of US royalties. We can still get you sorted. Want me to start the application?",
    },
    closing: {
      short: "Ready to start your ITIN? Sending the link.",
      medium:
        "Let's start your ITIN and stop the 30% loss. Sending the secure link?",
      long:
        "Let's get your ITIN started so you stop losing 30% of your earnings. I'll send the secure payment link, you complete it, and I'll begin the IRS application the same day. Shall I send the link?",
    },
  }),
  ...make("vat", {
    facebook_dm: {
      short: "Hi {name}, reclaim 20% on every UK ad pound — VAT register?",
      medium:
        "Hi {name}, if you run ads from a UK LTD, registering for VAT lets you reclaim 20% on every pound. Want help?",
      long:
        "Hi {name}, saw your UK LTD. If you spend on Meta, Google or supplier invoices, VAT registration lets you reclaim 20% on every pound. We handle the HMRC registration and scheme choice. Want pricing?",
    },
    whatsapp: {
      short: "Salam {name} 👋 VAT registration = 20% reclaim on UK ads.",
      medium:
        "Salam {name} 👋 If you run UK ads, VAT registration reclaims 20%. We handle HMRC for you.",
      long:
        "Salam {name} 👋 Hope you're well. Quick one — if you have a UK LTD and spend on ads or UK suppliers, VAT registration gets you 20% back on every pound. We handle the HMRC application and explain which scheme suits you best.",
    },
    follow_up: {
      short: "Hey {name}, want to start the VAT registration?",
      medium:
        "Hey {name}, following up on VAT. Happy to clarify which scheme (Standard vs Flat Rate) suits you.",
      long:
        "Hey {name}, hope you're well. Following up on VAT. The scheme choice (Standard vs Flat Rate) often decides how much you save — happy to walk through it for your numbers in 10 minutes.",
    },
    re_engagement: {
      short: "Hi {name}, VAT reclaim is still on the table.",
      medium:
        "Hi {name}, just a reminder — every month without VAT registration is reclaim you're losing on ads. Want help?",
      long:
        "Hi {name}, hope you're well. Quick nudge — every month you spend on UK ads without being VAT registered, you're leaving 20% on the table. Want me to start the HMRC application?",
    },
    closing: {
      short: "Ready to start VAT? Sending the link.",
      medium:
        "Let's get your VAT registration filed. Sending the secure link?",
      long:
        "Let's get your VAT registration filed with HMRC so you can start reclaiming on every ad pound. I'll send the secure payment link, you complete it, and we file the same week. Shall I send the link?",
    },
  }),
  ...make("payoneer", {
    facebook_dm: {
      short: "Hi {name}, want to receive Upwork/Fiverr/Amazon in one place?",
      medium:
        "Hi {name}, Payoneer gives you USD/EUR/GBP receiving accounts and withdraws to your local bank. Want help opening one?",
      long:
        "Hi {name}, saw your freelance work. Payoneer gives you USD, EUR, and GBP receiving accounts, accepts Upwork/Fiverr/Amazon payouts, and withdraws to your local bank cleanly. We help with approval and setup. Want details?",
    },
    whatsapp: {
      short: "Salam {name} 👋 Payoneer account — want help opening it?",
      medium:
        "Salam {name} 👋 Hope all good. Want help opening a Payoneer business account? Marketplace payouts, multi-currency.",
      long:
        "Salam {name} 👋 Hope you're well. Want help opening a Payoneer account? You get USD/EUR/GBP receiving accounts, marketplace payouts (Upwork, Fiverr, Amazon), and clean local withdrawals. Quick approval if your application is set up right.",
    },
    follow_up: {
      short: "Hey {name}, want me to start your Payoneer signup?",
      medium:
        "Hey {name}, following up on Payoneer. Most rejections come from weak business descriptions — happy to help you get approved first try.",
      long:
        "Hey {name}, hope you're good. Following up on Payoneer. Most rejections happen because of weak business descriptions or missing proofs — we coach you through it so you get approved first try. Want help?",
    },
    re_engagement: {
      short: "Hi {name}, Payoneer offer still open if you want.",
      medium:
        "Hi {name}, Payoneer is still on the table — quick approval window this month.",
      long:
        "Hi {name}, hope all good. Just a nudge — Payoneer approvals are moving fast this month. If you want help getting set up, I'm here.",
    },
    closing: {
      short: "Ready to open your Payoneer? Sending the link.",
      medium:
        "Let's open your Payoneer account. Sending the secure link?",
      long:
        "Let's open your Payoneer so you can receive marketplace payouts cleanly. I'll send the secure payment link and guide you through the approval steps. Shall I send the link?",
    },
  }),
  ...make("wise", {
    facebook_dm: {
      short: "Hi {name}, save 4-6% on every cross-border payment with Wise.",
      medium:
        "Hi {name}, Wise Business gives you real FX rates and local account details in 40+ currencies. We help UK LTDs and US LLCs get approved fast.",
      long:
        "Hi {name}, saw your UK LTD / US LLC. Wise Business gives you real mid-market FX, local account details in USD/GBP/EUR, and clean Stripe payouts. We help with approval and avoid common rejection traps. Want help?",
    },
    whatsapp: {
      short: "Salam {name} 👋 Wise Business — want help applying?",
      medium:
        "Salam {name} 👋 Wise Business in 7 days, real FX, local USD/GBP/EUR accounts. Want help applying?",
      long:
        "Salam {name} 👋 Hope you're well. Wise Business gives you real exchange rates and local account details — but the application gets rejected if it's not set up right. We pre-vet it so you get approved first try. Want help?",
    },
    follow_up: {
      short: "Hey {name}, want me to help with the Wise application?",
      medium:
        "Hey {name}, following up on Wise. Happy to pre-vet your application to maximise approval odds.",
      long:
        "Hey {name}, hope you're good. Following up on Wise. Most rejections come from weak descriptions or missing proofs — we pre-vet so you get approved first try. Want help?",
    },
    re_engagement: {
      short: "Hi {name}, Wise approvals are moving fast this week.",
      medium:
        "Hi {name}, Wise has been approving applications quickly this week — good time to apply.",
      long:
        "Hi {name}, hope you're well. Quick update — Wise is approving applications faster this week. If you've been delaying, now is a good window. Want help with the application?",
    },
    closing: {
      short: "Ready to apply for Wise? Sending the link.",
      medium:
        "Let's get your Wise Business open. Sending the secure link?",
      long:
        "Let's get your Wise Business application sorted with the right setup so you get approved first try. I'll send the secure payment link, you complete it, and I'll guide you through the application the same day. Shall I send the link?",
    },
  }),
  ...make("stripe", {
    facebook_dm: {
      short: "Hi {name}, want Stripe approved on the first try?",
      medium:
        "Hi {name}, Stripe rejects most non-US/UK applications due to weak setup. We fix that — UK LTD/US LLC + bank + site = approved.",
      long:
        "Hi {name}, saw your SaaS / agency. Stripe is the make-or-break for global payments — and most applications get rejected. We set up the right entity (UK LTD or US LLC), Wise/Mercury, and a compliant site so you get approved first try. Want details?",
    },
    whatsapp: {
      short: "Salam {name} 👋 Stripe approval — want help?",
      medium:
        "Salam {name} 👋 Stripe rejected before? We fix the entity, bank, and site so you get approved first try.",
      long:
        "Salam {name} 👋 Hope all good. If Stripe rejected you before, it's almost never the application — it's the entity, bank, or website. We fix all three. Most of our partners get approved first try. Want help?",
    },
    follow_up: {
      short: "Hey {name}, want me to walk through the Stripe approval plan?",
      medium:
        "Hey {name}, following up on Stripe. Happy to walk you through the 3 things that decide approval — on a quick call.",
      long:
        "Hey {name}, hope the week's been good. Following up on Stripe. There are exactly 3 things that decide approval — entity, bank, and website. I'm happy to walk through them on a 10-minute call so you go in with the strongest shot.",
    },
    re_engagement: {
      short: "Hi {name}, Stripe approval bundle live this week.",
      medium:
        "Hi {name}, we just launched a Stripe-ready bundle (LLC + EIN + Wise). Thought of you.",
      long:
        "Hi {name}, hope all good. We just launched a Stripe-ready bundle — LLC + EIN + Wise + site review — designed for first-try approval. Remembered you were exploring Stripe. Want details?",
    },
    closing: {
      short: "Ready to start the Stripe-ready bundle? Sending the link.",
      medium:
        "Let's get your Stripe-ready setup started. Sending the secure link?",
      long:
        "Let's get your full Stripe-ready setup started — entity, bank, and site sorted in the right order. I'll send the secure payment link and we begin the same day. Shall I send the link?",
    },
  }),
  ...make("paypal", {
    facebook_dm: {
      short: "Hi {name}, want PayPal Business set up cleanly?",
      medium:
        "Hi {name}, PayPal Business adds trust at checkout and unlocks buyers who only pay PayPal. We help with setup + freeze-avoidance.",
      long:
        "Hi {name}, saw your work. PayPal Business adds checkout trust and unlocks a whole segment of buyers who refuse to use cards. We help set it up the right way and avoid common freeze triggers. Want details?",
    },
    whatsapp: {
      short: "Salam {name} 👋 PayPal Business — want help?",
      medium:
        "Salam {name} 👋 PayPal Business setup + freeze-avoidance guide — want help?",
      long:
        "Salam {name} 👋 Hope you're well. PayPal Business gives you checkout trust and reaches buyers who won't use cards. The key is setting it up safely so it doesn't get frozen. We handle both. Want help?",
    },
    follow_up: {
      short: "Hey {name}, want me to start the PayPal setup?",
      medium:
        "Hey {name}, following up on PayPal. Happy to share freeze-avoidance tips before you start ramping.",
      long:
        "Hey {name}, hope you're well. Following up on PayPal. The freeze risk worries most founders — happy to share the ramp-up plan that keeps your account healthy.",
    },
    re_engagement: {
      short: "Hi {name}, PayPal Business window still open.",
      medium:
        "Hi {name}, still keen on PayPal Business? Happy to help when you're ready.",
      long:
        "Hi {name}, hope all good. Quick nudge — if PayPal Business is still on your list, I'm here. We help with safe setup + ramp-up.",
    },
    closing: {
      short: "Ready to open PayPal Business? Sending the link.",
      medium:
        "Let's open your PayPal Business safely. Sending the secure link?",
      long:
        "Let's open your PayPal Business with the right setup so it stays healthy. I'll send the secure payment link, walk you through ramp-up, and you'll be live shortly. Shall I send the link?",
    },
  }),
];

export function getScripts(service: string): SalesScript[] {
  return SALES_SCRIPTS.filter((s) => s.service === service);
}
export function getScript(
  service: string,
  channel: ScriptChannel,
  length: ScriptLength = "medium",
): string | undefined {
  return SALES_SCRIPTS.find((s) => s.service === service && s.channel === channel)?.[length];
}

// ============================================================
// OBJECTION HANDLING LIBRARY
// ============================================================

export type ObjectionKey =
  | "too_expensive"
  | "thinking_about_it"
  | "not_interested"
  | "need_more_info"
  | "need_time"
  | "already_have_provider"
  | "trust_concerns"
  | "payment_concerns";

export interface ObjectionHandler {
  key: ObjectionKey;
  label: string;
  short: string;
  medium: string;
  long: string;
}

const O = (o: ObjectionHandler) => o;

export const OBJECTION_LIBRARY: ObjectionHandler[] = [
  O({
    key: "too_expensive",
    label: "Too expensive",
    short: "Fair — let's compare it to the income one new global client brings.",
    medium:
      "Totally fair. The fee is a one-time investment. Most of our partners earn it back from one extra Western client because credibility lifts pricing power.",
    long:
      "Totally fair concern. The way I look at it — this is a one-time investment that unlocks Stripe, Wise, and global clients for years. Most partners win one extra client at higher rates within 30 days, which pays this back many times over. Want me to break down the ROI for your situation?",
  }),
  O({
    key: "thinking_about_it",
    label: "I will think about it",
    short: "Makes sense. What's the one thing you'd want clearer to decide?",
    medium:
      "Totally fair. Quick question — what's the one piece of info you'd want clearer to make the decision easier? I can send it across.",
    long:
      "That makes sense — this is a real decision. Usually 'thinking about it' means there's one specific worry left. If you tell me what it is — price, timing, risk, something else — I can address it directly. No pressure, just want to make it easy for you.",
  }),
  O({
    key: "not_interested",
    label: "Not interested",
    short: "All good — can I ask what would make this relevant?",
    medium:
      "Totally fair. Out of curiosity — is it the timing, the offer, or the topic itself? Helps me serve people better.",
    long:
      "No problem at all. Out of curiosity, was it the timing, the offer, or just not the right service for you right now? Honest feedback helps me — and if your situation changes, I'm here.",
  }),
  O({
    key: "need_more_info",
    label: "Need more information",
    short: "Of course — what specifically do you want covered?",
    medium:
      "Happy to. What specifically would you like — pricing, timing, requirements, or a case study? I'll send it focused on that.",
    long:
      "Of course — I want you to feel fully informed. Tell me which area: pricing, requirements, timeline, tax, or a real client example, and I'll send something focused on that instead of dumping everything at once.",
  }),
  O({
    key: "need_time",
    label: "Need time",
    short: "No problem — when's a good time to circle back?",
    medium:
      "Totally fair. When would be a good time to check back in — next week, end of month? I'll set a reminder.",
    long:
      "Totally understand. When works best for me to check back — next week, in 2 weeks, or end of month? I'll set a reminder and won't keep nudging you in the meantime.",
  }),
  O({
    key: "already_have_provider",
    label: "Already have a provider",
    short: "Got it. Mind sharing what's working / not working there?",
    medium:
      "Makes sense. Out of interest — what's working well with them and what's missing? Sometimes we complement, sometimes we don't fit.",
    long:
      "Great — that's good. Out of interest, what's working well with them and what's missing? Honest answer helps me tell you whether we'd add value or whether you should stay. No pressure either way.",
  }),
  O({
    key: "trust_concerns",
    label: "Trust concerns",
    short: "Fair — happy to share verified reviews and a refund policy.",
    medium:
      "Totally fair concern. I'll send verified reviews, our refund policy, and you can speak to a past client if you'd like.",
    long:
      "100% fair — you should never send money to someone you don't trust. I'll share verified reviews, our refund policy, examples of recent client deliverables, and you can speak to a past client directly if you'd like. Take your time.",
  }),
  O({
    key: "payment_concerns",
    label: "Payment concerns",
    short: "All payments are on a secure gateway with refund cover.",
    medium:
      "All payments go through a secure gateway with refund protection. You're never sending cash blind — happy to walk you through it.",
    long:
      "Totally fair. Every payment goes through a secure gateway, you get a receipt, and our refund policy covers you if we don't deliver as agreed. I can walk you through the exact flow before you pay a rupee. Want me to send the step-by-step?",
  }),
];

export function getObjection(key: ObjectionKey, length: ScriptLength = "medium"): string | undefined {
  return OBJECTION_LIBRARY.find((o) => o.key === key)?.[length];
}

// ============================================================
// ASSISTANT TRAINING NOTES
// Plugged into Growth Coach system prompt to align tone with these scripts.
// ============================================================
export const SALES_COACH_TRAINING = `
You are the partner's sales coach. When the partner asks for a script,
follow-up, or objection response, draw from the structured Sales Knowledge
Database. Rules:

1. Always offer Short / Medium / Long versions unless the partner asks for one.
2. Tone: warm, founder-to-founder, English with light Roman-Urdu only where
   the partner uses it first.
3. Never use heavy markdown stars or emojis beyond 1 per message.
4. Every script must end with a single clear next step.
5. For objections, validate first ("totally fair"), then reframe, then offer
   one concrete next step.
6. Recommend bundles when natural (UK LTD + Wise, US LLC + EIN, Stripe +
   entity + bank).
7. Never invent prices — defer to the live service price.
`.trim();

export const SALES_KB_STATS = {
  services: 9,
  channels: 5,
  lengthsPerScript: 3,
  totalScripts: SALES_SCRIPTS.length * 3,
  objections: OBJECTION_LIBRARY.length,
} as const;
