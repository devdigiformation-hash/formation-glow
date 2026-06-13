// Growth Guide — short, actionable training steps. Bilingual EN/UR.

export type GuideStep = { title: string; body: string };
export type GuideCategory =
  | "getting-started"
  | "facebook-marketing"
  | "whatsapp-marketing"
  | "sales-training"
  | "content-creation"
  | "lead-generation";

export type GuideCard = {
  id: string;
  category: GuideCategory;
  title: string;
  subtitle: string;
  emoji: string;
  steps: GuideStep[];
};

export type GuideLang = "en" | "ur";

export const CATEGORY_META: { id: GuideCategory; label: string; labelUr: string; emoji: string }[] = [
  { id: "getting-started", label: "Getting Started", labelUr: "شروعات", emoji: "🚀" },
  { id: "facebook-marketing", label: "Facebook Marketing", labelUr: "Facebook مارکیٹنگ", emoji: "👥" },
  { id: "whatsapp-marketing", label: "WhatsApp Marketing", labelUr: "WhatsApp مارکیٹنگ", emoji: "📱" },
  { id: "sales-training", label: "Sales Training", labelUr: "Sales ٹریننگ", emoji: "💼" },
  { id: "content-creation", label: "Content Creation", labelUr: "Content بنانا", emoji: "🎨" },
  { id: "lead-generation", label: "Lead Generation", labelUr: "Lead Generation", emoji: "🎯" },
];

export const GUIDE_CARDS_EN: GuideCard[] = [
  {
    id: "launch-7day",
    category: "getting-started",
    title: "7-Day Launch Plan",
    subtitle: "Your first week as a partner.",
    emoji: "🚀",
    steps: [
      { title: "Day 1 — Setup", body: "Complete your partner profile.\nCreate your Facebook Page and add a WhatsApp button." },
      { title: "Day 2 — Research", body: "Join 5 relevant groups.\nComment on 5 posts. Do not sell yet." },
      { title: "Day 3 — First Post", body: "Publish your first Rebrand Studio creative.\nReply to every comment within 1 hour." },
      { title: "Day 4 — Engage", body: "Reply to all DMs.\nSend WhatsApp follow-up to warm leads." },
      { title: "Day 5 — Second Post", body: "Post a different service angle.\nShare to your story." },
      { title: "Day 6 — Social Proof", body: "Post a client win or testimonial.\nRepost in 3 niche groups." },
      { title: "Day 7 — Review", body: "Find your best post and best group.\nDouble down on the winner next week." },
    ],
  },
  {
    id: "social-profile",
    category: "getting-started",
    title: "Social Profile Setup",
    subtitle: "A profile that converts.",
    emoji: "🪪",
    steps: [
      { title: "Profile photo", body: "Use your partner logo or a clean headshot.\nSame photo on Facebook, Instagram, WhatsApp." },
      { title: "Cover image", body: "Use a Rebrand Studio banner.\nMention 3 services and show WhatsApp contact." },
      { title: "Bio", body: "One line: what you do.\nOne line: who you serve.\nOne line: how to contact you." },
    ],
  },
  {
    id: "fb-groups",
    category: "facebook-marketing",
    title: "Facebook Group Strategy",
    subtitle: "Where to post and how to behave.",
    emoji: "👥",
    steps: [
      { title: "Pick niches", body: "Formation: UK LTD, US LLC, Startups.\nEcommerce: Amazon FBA, Shopify, Etsy.\nPayments: Stripe, PayPal, Wise." },
      { title: "Join safely", body: "Join 3–5 groups per day on a new account.\nWarm up pages 5–7 days before promoting." },
      { title: "Posting flow", body: "Read pinned rules. Engage for 2 days.\nPost one creative, reply to every comment." },
      { title: "DM strategy", body: "Only DM people who comment positively.\nLead with value, never with a sales pitch." },
    ],
  },
  {
    id: "fb-ads",
    category: "facebook-marketing",
    title: "Facebook Ads Basics",
    subtitle: "Only after organic works.",
    emoji: "🎯",
    steps: [
      { title: "Pre-flight", body: "Have 5+ organic posts live.\nPage must be 7+ days old." },
      { title: "First campaign", body: "Objective: Messages or Leads.\nStart at USD 5/day." },
      { title: "Creative", body: "Use a Rebrand Studio image.\n3 lines of copy max. CTA: 'WhatsApp us'." },
    ],
  },
  {
    id: "whatsapp",
    category: "whatsapp-marketing",
    title: "WhatsApp Follow-up",
    subtitle: "Convert warm leads on WhatsApp.",
    emoji: "📱",
    steps: [
      { title: "First message", body: "Hi {name}, this is {you} from {brand}. Following up on {service}.\nAre you launching in 30 days or just exploring?" },
      { title: "48-hour follow-up", body: "Just checking in on {service}.\nHappy to jump on a 10-min call if easier." },
      { title: "Close", body: "Send pricing + steps in 1 message, not 5.\nAsk: 'Shall I share the payment link?'" },
    ],
  },
  {
    id: "whatsapp-broadcast",
    category: "whatsapp-marketing",
    title: "WhatsApp Broadcast Rules",
    subtitle: "Stay safe, stay delivered.",
    emoji: "📢",
    steps: [
      { title: "List hygiene", body: "Only broadcast to saved contacts.\nMax 256 per broadcast list." },
      { title: "Frequency", body: "Max 2 broadcasts per week.\nMix value and offer — never offer only." },
      { title: "Format", body: "Short message + 1 image.\nClear CTA at the bottom." },
    ],
  },
  {
    id: "sales-closing",
    category: "sales-training",
    title: "Sales Closing",
    subtitle: "Turn conversations into orders.",
    emoji: "💼",
    steps: [
      { title: "Qualify first", body: "Ask budget and timeline up front.\nDo not pitch unqualified leads." },
      { title: "Present value", body: "Lead with outcomes, not features.\nUse one client example." },
      { title: "Ask for the order", body: "Direct ask: 'Shall we start today?'\nSend payment link immediately on yes." },
    ],
  },
  {
    id: "objection-handling",
    category: "sales-training",
    title: "Objection Handling",
    subtitle: "Handle 'too expensive' and 'let me think'.",
    emoji: "🛡️",
    steps: [
      { title: "Too expensive", body: "'Compared to what?' — find the real concern.\nReframe to monthly cost or ROI." },
      { title: "Let me think", body: "'What specifically do you want to think about?'\nAddress that one concern now." },
      { title: "No reply", body: "Send one value follow-up after 48 hours.\nClose the loop after the 3rd silent message." },
    ],
  },
  {
    id: "posting-schedule",
    category: "content-creation",
    title: "Posting Schedule",
    subtitle: "Safe cadence that does not get flagged.",
    emoji: "📅",
    steps: [
      { title: "Weekly cadence", body: "3–5 posts per week per platform.\nRotate services, do not repeat one." },
      { title: "Best times", body: "Morning 9–11 AM local.\nEvening 7–9 PM local." },
      { title: "Group posting", body: "Max 1 group post per day per account.\nDifferent caption for every group." },
    ],
  },
  {
    id: "content-mix",
    category: "content-creation",
    title: "Content Mix",
    subtitle: "What to post each week.",
    emoji: "🎨",
    steps: [
      { title: "Educational", body: "Teach one tip about your service.\nNo selling — pure value." },
      { title: "Service", body: "Show what you offer with a Rebrand creative.\nClear price hint + CTA." },
      { title: "Social proof", body: "Client win, testimonial, or before/after.\nReal screenshots beat polished graphics." },
    ],
  },
  {
    id: "outreach",
    category: "lead-generation",
    title: "Outreach Scripts",
    subtitle: "DMs and comments that get replies.",
    emoji: "💬",
    steps: [
      { title: "DM — first touch", body: "Hi {name}, saw your post about {topic}.\nHappy to share a quick checklist — no pitch." },
      { title: "Warm comment reply", body: "Great question {name}. We handle this end-to-end.\nI've sent a checklist in DM." },
      { title: "Re-engage cold lead", body: "Circling back — we just updated {service}.\nWant the new details?" },
    ],
  },
  {
    id: "lead-qualification",
    category: "lead-generation",
    title: "Lead Qualification",
    subtitle: "Spot real buyers fast.",
    emoji: "🔍",
    steps: [
      { title: "3 questions", body: "What are you launching?\nWhen do you want to start?\nWhat's your budget range?" },
      { title: "Score the lead", body: "Hot: clear timeline + budget.\nWarm: timeline OR budget.\nCold: neither — nurture only." },
      { title: "Route fast", body: "Hot leads: WhatsApp call within 1 hour.\nWarm: follow-up script.\nCold: add to weekly newsletter." },
    ],
  },
];

export const GUIDE_CARDS_UR: GuideCard[] = [
  {
    id: "launch-7day",
    category: "getting-started",
    title: "7 دن کا Launch Plan",
    subtitle: "Partner کے طور پر آپ کا پہلا ہفتہ۔",
    emoji: "🚀",
    steps: [
      { title: "Day 1 — Setup", body: "Partner profile مکمل کریں۔\nFacebook Page بنائیں اور WhatsApp button لگائیں۔" },
      { title: "Day 2 — Research", body: "5 relevant groups join کریں۔\n5 posts پر comment کریں۔ ابھی selling نہ کریں۔" },
      { title: "Day 3 — پہلی Post", body: "Rebrand Studio سے پہلی creative post کریں۔\nہر comment کا 1 گھنٹے میں reply دیں۔" },
      { title: "Day 4 — Engage", body: "تمام DMs کا reply دیں۔\nWarm leads کو WhatsApp follow-up کریں۔" },
      { title: "Day 5 — دوسری Post", body: "مختلف service angle سے post کریں۔\nStory پر share کریں۔" },
      { title: "Day 6 — Social Proof", body: "Client win یا testimonial post کریں۔\n3 niche groups میں share کریں۔" },
      { title: "Day 7 — Review", body: "Best post اور best group identify کریں۔\nاگلے ہفتے winner پر focus کریں۔" },
    ],
  },
  {
    id: "social-profile",
    category: "getting-started",
    title: "Social Profile Setup",
    subtitle: "ایسا profile جو convert کرے۔",
    emoji: "🪪",
    steps: [
      { title: "Profile photo", body: "Partner logo یا صاف headshot لگائیں۔\nFacebook، Instagram، WhatsApp پر ایک ہی photo۔" },
      { title: "Cover image", body: "Rebrand Studio کا banner لگائیں۔\n3 services اور WhatsApp contact دکھائیں۔" },
      { title: "Bio", body: "ایک line: آپ کیا کرتے ہیں۔\nایک line: کس کے لیے۔\nایک line: contact کیسے۔" },
    ],
  },
  {
    id: "fb-groups",
    category: "facebook-marketing",
    title: "Facebook Group Strategy",
    subtitle: "کہاں اور کیسے post کریں۔",
    emoji: "👥",
    steps: [
      { title: "Niches منتخب کریں", body: "Formation: UK LTD، US LLC، Startups۔\nEcommerce: Amazon FBA، Shopify، Etsy۔\nPayments: Stripe، PayPal، Wise۔" },
      { title: "Safely join کریں", body: "نئے account پر روزانہ 3–5 groups۔\nPages کو 5–7 دن warm up کریں۔" },
      { title: "Posting flow", body: "Pinned rules پڑھیں۔ 2 دن engage کریں۔\nایک creative post کریں، ہر comment کا reply دیں۔" },
      { title: "DM strategy", body: "صرف positive comment کرنے والوں کو DM کریں۔\nValue سے شروع، sales pitch سے نہیں۔" },
    ],
  },
  {
    id: "fb-ads",
    category: "facebook-marketing",
    title: "Facebook Ads Basics",
    subtitle: "صرف organic چلنے کے بعد۔",
    emoji: "🎯",
    steps: [
      { title: "Pre-flight", body: "5+ organic posts پہلے سے live ہوں۔\nPage 7+ دن پرانا ہو۔" },
      { title: "پہلی Campaign", body: "Objective: Messages یا Leads۔\nUSD 5 روزانہ سے start کریں۔" },
      { title: "Creative", body: "Rebrand Studio image۔\n3 lines copy، CTA: 'WhatsApp us'۔" },
    ],
  },
  {
    id: "whatsapp",
    category: "whatsapp-marketing",
    title: "WhatsApp Follow-up",
    subtitle: "Warm leads کو WhatsApp پر convert کریں۔",
    emoji: "📱",
    steps: [
      { title: "پہلا message", body: "Hi {name}، میں {آپ} from {brand}۔ {service} کے بارے میں follow-up۔\n30 دن میں launch کرنا ہے یا ابھی explore؟" },
      { title: "48 گھنٹے follow-up", body: "{service} پر check کر رہا ہوں۔\nآسانی ہو تو 10 منٹ کی call کر لیں۔" },
      { title: "Close", body: "Pricing اور steps 1 message میں بھیجیں، 5 میں نہیں۔\nپوچھیں: 'Payment link share کر دوں؟'" },
    ],
  },
  {
    id: "whatsapp-broadcast",
    category: "whatsapp-marketing",
    title: "WhatsApp Broadcast Rules",
    subtitle: "Safe رہیں، deliver ہوں۔",
    emoji: "📢",
    steps: [
      { title: "List hygiene", body: "صرف saved contacts کو broadcast کریں۔\nزیادہ سے زیادہ 256 per list۔" },
      { title: "Frequency", body: "ہفتے میں زیادہ سے زیادہ 2 broadcasts۔\nValue اور offer mix رکھیں۔" },
      { title: "Format", body: "Short message + 1 image۔\nنیچے واضح CTA۔" },
    ],
  },
  {
    id: "sales-closing",
    category: "sales-training",
    title: "Sales Closing",
    subtitle: "Conversation کو order میں بدلیں۔",
    emoji: "💼",
    steps: [
      { title: "پہلے qualify کریں", body: "Budget اور timeline شروع میں پوچھیں۔\nغیر qualified leads کو pitch نہ کریں۔" },
      { title: "Value present کریں", body: "Features نہیں، outcomes پر بات کریں۔\nایک client example دیں۔" },
      { title: "Order مانگیں", body: "صاف پوچھیں: 'آج start کر دیں؟'\nHaan پر فوراً payment link بھیجیں۔" },
    ],
  },
  {
    id: "objection-handling",
    category: "sales-training",
    title: "Objection Handling",
    subtitle: "'Mehnga hai' اور 'سوچ کے بتاتا ہوں'۔",
    emoji: "🛡️",
    steps: [
      { title: "Too expensive", body: "'کس سے compare کر رہے ہیں؟' — اصل concern نکالیں۔\nMonthly cost یا ROI میں reframe کریں۔" },
      { title: "سوچ کے بتاتا ہوں", body: "'کیا specific چیز سوچنی ہے؟'\nوہی ایک concern ابھی حل کریں۔" },
      { title: "Reply نہیں آیا", body: "48 گھنٹے بعد ایک value follow-up۔\n3 silent messages کے بعد close کریں۔" },
    ],
  },
  {
    id: "posting-schedule",
    category: "content-creation",
    title: "Posting Schedule",
    subtitle: "Safe cadence جو flag نہ ہو۔",
    emoji: "📅",
    steps: [
      { title: "ہفتہ وار cadence", body: "ہر platform پر 3–5 posts فی ہفتہ۔\nServices بدلتے رہیں۔" },
      { title: "بہترین اوقات", body: "صبح 9–11 local۔\nشام 7–9 local۔" },
      { title: "Group posting", body: "روزانہ زیادہ سے زیادہ 1 group post۔\nہر group کے لیے مختلف caption۔" },
    ],
  },
  {
    id: "content-mix",
    category: "content-creation",
    title: "Content Mix",
    subtitle: "ہفتے میں کیا post کریں۔",
    emoji: "🎨",
    steps: [
      { title: "Educational", body: "Service کا ایک tip سکھائیں۔\nNo selling — صرف value۔" },
      { title: "Service", body: "Rebrand creative کے ساتھ offering دکھائیں۔\nPrice hint + CTA۔" },
      { title: "Social proof", body: "Client win، testimonial، یا before/after۔\nReal screenshots زیادہ کام کرتے ہیں۔" },
    ],
  },
  {
    id: "outreach",
    category: "lead-generation",
    title: "Outreach Scripts",
    subtitle: "DMs اور comments جو reply لائیں۔",
    emoji: "💬",
    steps: [
      { title: "DM — first touch", body: "Hi {name}، آپ کی {topic} والی post دیکھی۔\nQuick checklist بھیج دوں — no pitch۔" },
      { title: "Warm comment reply", body: "اچھا سوال {name}۔ یہ ہم end-to-end handle کرتے ہیں۔\nDM میں checklist بھیج دی۔" },
      { title: "Cold lead re-engage", body: "دوبارہ check کر رہا ہوں — {service} update ہوا ہے۔\nنئی details بھیج دوں؟" },
    ],
  },
  {
    id: "lead-qualification",
    category: "lead-generation",
    title: "Lead Qualification",
    subtitle: "اصلی buyers جلدی پہچانیں۔",
    emoji: "🔍",
    steps: [
      { title: "3 سوال", body: "کیا launch کر رہے ہیں؟\nکب start کرنا ہے؟\nBudget range کیا ہے؟" },
      { title: "Lead score", body: "Hot: timeline + budget دونوں۔\nWarm: ایک۔\nCold: کوئی نہیں — nurture۔" },
      { title: "جلدی route کریں", body: "Hot: 1 گھنٹے میں WhatsApp call۔\nWarm: follow-up script۔\nCold: weekly newsletter۔" },
    ],
  },
];

export function getGuideCards(lang: GuideLang): GuideCard[] {
  return lang === "ur" ? GUIDE_CARDS_UR : GUIDE_CARDS_EN;
}

export function cardToPlainText(card: GuideCard): string {
  return [
    card.title,
    card.subtitle,
    "",
    ...card.steps.flatMap((s) => [s.title, s.body, ""]),
  ].join("\n").trim();
}
