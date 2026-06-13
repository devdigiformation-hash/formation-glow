// KD.2 — Complete Growth Coach Database.
// Per-service action plans + cross-service promotion guides, bilingual EN/UR.
// Pure static module used by Growth Coach + Marketing Guide UI.

export type Lang = "en" | "ur";

export interface ServicePlaybook {
  slug: string;
  name: string;
  audience: { en: string[]; ur: string[] };
  sevenDayPlan: { en: string[]; ur: string[] };
  thirtyDayPlan: { en: string[]; ur: string[] };
  dailyTasks: { en: string[]; ur: string[] };
  postingSchedule: { en: string[]; ur: string[] };
  promotionStrategy: { en: string[]; ur: string[] };
  followUpStrategy: { en: string[]; ur: string[] };
}

const P = (p: ServicePlaybook) => p;

// ============================================================
// PER-SERVICE PLAYBOOKS
// ============================================================
export const SERVICE_PLAYBOOKS: ServicePlaybook[] = [
  P({
    slug: "uk-ltd",
    name: "UK LTD Formation",
    audience: {
      en: [
        "Freelancers wanting Western clients",
        "Amazon UK / Etsy / Shopify sellers",
        "Agencies invoicing UK and EU clients",
        "Pakistani founders going global",
      ],
      ur: [
        "Freelancers jo Western clients chahte hain",
        "Amazon UK, Etsy, Shopify sellers",
        "Agencies jo UK aur EU clients ko invoice karti hain",
        "Pakistani founders jo global market mein jaana chahte hain",
      ],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post your story — why a UK LTD changes a freelancer's life.",
        "Day 2: Share a benefits carousel (Stripe, Wise, Amazon UK access).",
        "Day 3: Join 5 niche Facebook groups (freelance, e-com, agency).",
        "Day 4: Post a 3-step explainer reel.",
        "Day 5: Share a real client mini case study.",
        "Day 6: Reply to every comment and DM personally.",
        "Day 7: Review what got engagement and double down.",
      ],
      ur: [
        "Day 1: Apni story share karein — UK LTD freelancer ki life kaise badalti hai.",
        "Day 2: Benefits carousel post karein (Stripe, Wise, Amazon UK).",
        "Day 3: 5 niche Facebook groups join karein.",
        "Day 4: 3-step explainer reel banayein.",
        "Day 5: Ek real client ka mini case study share karein.",
        "Day 6: Har comment aur DM ka personal jawab dein.",
        "Day 7: Dekhein kya cheez chali, usi par focus barhayein.",
      ],
    },
    thirtyDayPlan: {
      en: [
        "Week 1: Build awareness — daily posts + group introductions.",
        "Week 2: Educate — myths, FAQs, comparisons (UK vs US).",
        "Week 3: Convert — testimonials, case studies, limited-time offer.",
        "Week 4: Scale — referrals, retargeting DMs, second wave content.",
      ],
      ur: [
        "Week 1: Awareness banayein — daily posts aur groups mein intro.",
        "Week 2: Educate karein — myths, FAQs, UK vs US comparison.",
        "Week 3: Convert karein — testimonials, case studies, limited offer.",
        "Week 4: Scale karein — referrals, retargeting DMs, naya content.",
      ],
    },
    dailyTasks: {
      en: [
        "Post 1 piece of content (reel, carousel, or story).",
        "Reply to all DMs within 2 hours.",
        "Engage on 10 posts in target groups.",
        "Send 3 personal follow-ups to warm leads.",
      ],
      ur: [
        "Roz 1 content piece post karein.",
        "Sab DMs ka 2 ghante mein jawab dein.",
        "Target groups ke 10 posts par engage karein.",
        "3 warm leads ko personal follow-up karein.",
      ],
    },
    postingSchedule: {
      en: [
        "Mon: Educational post (what is UK LTD).",
        "Tue: Benefit carousel.",
        "Wed: Reel — 60-second client story.",
        "Thu: FAQ / myth busting.",
        "Fri: Offer / call-to-action.",
        "Sat: Behind-the-scenes / story.",
        "Sun: Recap + testimonial.",
      ],
      ur: [
        "Mon: Educational post (UK LTD kya hai).",
        "Tue: Benefits carousel.",
        "Wed: Reel — 60 second client story.",
        "Thu: FAQ ya myth busting.",
        "Fri: Offer aur call-to-action.",
        "Sat: Behind-the-scenes story.",
        "Sun: Recap aur testimonial.",
      ],
    },
    promotionStrategy: {
      en: [
        "Lead with credibility — UK companies = global trust.",
        "Pair every post with one clear next step (DM, link, call).",
        "Use case studies more than features.",
        "Cross-promote with Wise / Stripe content.",
      ],
      ur: [
        "Credibility highlight karein — UK company global trust deti hai.",
        "Har post ka 1 clear next step ho (DM, link, call).",
        "Features se zyada case studies use karein.",
        "Wise aur Stripe ke saath cross-promote karein.",
      ],
    },
    followUpStrategy: {
      en: [
        "Day 1 after lead: send personal welcome + 1 helpful resource.",
        "Day 3: send a relevant case study.",
        "Day 7: send pricing + clear offer.",
        "Day 14: soft check-in — 'still thinking it through?'",
      ],
      ur: [
        "Lead ke 1st din: personal welcome + 1 helpful resource bhejein.",
        "Day 3: ek relevant case study bhejein.",
        "Day 7: pricing aur offer bhejein.",
        "Day 14: soft check-in karein — abhi bhi soch rahe hain?",
      ],
    },
  }),
  P({
    slug: "us-llc",
    name: "US LLC Formation",
    audience: {
      en: ["SaaS founders", "Amazon US / Shopify US sellers", "Agencies with US clients", "Affiliate marketers"],
      ur: ["SaaS founders", "Amazon US aur Shopify US sellers", "Agencies jin ke US clients hain", "Affiliate marketers"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'You can own a US company without living in the US.'",
        "Day 2: Compare Wyoming vs Delaware vs New Mexico.",
        "Day 3: Join US business / Amazon US / SaaS groups.",
        "Day 4: Share 'Stripe US in 7 days' roadmap.",
        "Day 5: Testimonial or screenshot proof.",
        "Day 6: Q&A live or story.",
        "Day 7: Limited-time bundle (LLC + EIN).",
      ],
      ur: [
        "Day 1: Post karein — 'US company bina US mein rahe possible hai.'",
        "Day 2: Wyoming, Delaware aur New Mexico compare karein.",
        "Day 3: US business aur Amazon US groups join karein.",
        "Day 4: 'Stripe US 7 din mein' roadmap share karein.",
        "Day 5: Testimonial ya screenshot proof.",
        "Day 6: Q&A live ya story.",
        "Day 7: Limited offer — LLC + EIN bundle.",
      ],
    },
    thirtyDayPlan: {
      en: [
        "Week 1: Awareness — what an LLC unlocks (Stripe US, PayPal US).",
        "Week 2: Education — tax myths, state choice, common mistakes.",
        "Week 3: Conversion — case studies + bundle offers.",
        "Week 4: Scale — referrals + retargeting + upsell EIN/ITIN.",
      ],
      ur: [
        "Week 1: Awareness — LLC kya unlock karti hai (Stripe US, PayPal US).",
        "Week 2: Education — tax myths, state choice, common mistakes.",
        "Week 3: Conversion — case studies aur bundle offers.",
        "Week 4: Scale — referrals, retargeting aur EIN/ITIN upsell.",
      ],
    },
    dailyTasks: {
      en: ["1 post", "Engage in 2 US-business groups", "Reply to DMs in 2h", "3 warm follow-ups"],
      ur: ["1 post", "2 US-business groups mein engage karein", "DMs ka 2 ghante mein jawab", "3 warm follow-ups"],
    },
    postingSchedule: {
      en: [
        "Mon: Education — what is a US LLC.",
        "Tue: State comparison.",
        "Wed: Reel — Stripe US story.",
        "Thu: Tax FAQ.",
        "Fri: Offer / bundle.",
        "Sat: Behind-the-scenes.",
        "Sun: Testimonial recap.",
      ],
      ur: [
        "Mon: Education — US LLC kya hai.",
        "Tue: State comparison.",
        "Wed: Reel — Stripe US story.",
        "Thu: Tax FAQ.",
        "Fri: Offer ya bundle.",
        "Sat: Behind-the-scenes.",
        "Sun: Testimonial recap.",
      ],
    },
    promotionStrategy: {
      en: [
        "Sell market access (US clients, Stripe US, PayPal US).",
        "Bundle with EIN — almost no one wants LLC alone.",
        "Address tax fears head-on.",
      ],
      ur: [
        "Market access bechein (US clients, Stripe US, PayPal US).",
        "EIN ke saath bundle karein — sirf LLC kam log lete hain.",
        "Tax ke fears ka samna karein.",
      ],
    },
    followUpStrategy: {
      en: [
        "Day 1: send 'US LLC in 1 page' PDF.",
        "Day 3: send Stripe US case study.",
        "Day 7: send bundle pricing.",
        "Day 14: offer free 10-min call.",
      ],
      ur: [
        "Day 1: 'US LLC 1 page' PDF bhejein.",
        "Day 3: Stripe US case study bhejein.",
        "Day 7: bundle pricing bhejein.",
        "Day 14: 10-minute free call offer karein.",
      ],
    },
  }),
  P({
    slug: "ein",
    name: "EIN Number",
    audience: {
      en: ["New US LLC owners", "Stripe/PayPal applicants", "Amazon US sellers"],
      ur: ["Naye US LLC owners", "Stripe aur PayPal applicants", "Amazon US sellers"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'No SSN? You can still get an EIN.'",
        "Day 2: Explain what EIN unlocks.",
        "Day 3: Engage in US LLC owner groups.",
        "Day 4: Reel — 'How long the IRS really takes.'",
        "Day 5: Bundle offer with LLC owners.",
        "Day 6: Testimonial of approved EIN.",
        "Day 7: CTA — DM for help.",
      ],
      ur: [
        "Day 1: Post — 'SSN nahi? Phir bhi EIN mil sakta hai.'",
        "Day 2: EIN kya unlock karti hai bayan karein.",
        "Day 3: US LLC owner groups mein engage karein.",
        "Day 4: Reel — 'IRS asal mein kitna time leti hai.'",
        "Day 5: LLC owners ke liye bundle offer.",
        "Day 6: Approved EIN testimonial.",
        "Day 7: CTA — madad ke liye DM karein.",
      ],
    },
    thirtyDayPlan: {
      en: [
        "Week 1: Educate on EIN basics.",
        "Week 2: Address fears (timing, IRS rejection).",
        "Week 3: Promote EIN + LLC bundle.",
        "Week 4: Showcase approved EIN screenshots.",
      ],
      ur: [
        "Week 1: EIN basics par educate karein.",
        "Week 2: Fears address karein (time, IRS rejection).",
        "Week 3: EIN + LLC bundle promote karein.",
        "Week 4: Approved EIN screenshots share karein.",
      ],
    },
    dailyTasks: {
      en: ["1 short post", "5 group engagements", "Reply to DMs", "Tag 1 LLC owner who needs EIN"],
      ur: ["1 chhota post", "5 group engagements", "DMs ka jawab", "1 LLC owner ko tag karein"],
    },
    postingSchedule: {
      en: ["Mon: Myth", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Myth", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Always pair with LLC owners.", "Lead with 'no SSN required'.", "Realistic IRS timing."],
      ur: ["Hamesha LLC owners ke saath pair karein.", "Lead — 'SSN ki zaroorat nahi.'", "IRS timing realistic batayein."],
    },
    followUpStrategy: {
      en: ["Day 1: confirm requirements.", "Day 3: timeline reminder.", "Day 7: nudge with bundle."],
      ur: ["Day 1: requirements confirm karein.", "Day 3: timeline reminder.", "Day 7: bundle ke saath nudge."],
    },
  }),
  P({
    slug: "itin",
    name: "ITIN Number",
    audience: {
      en: ["Amazon KDP authors", "Royalty earners", "Non-US LLC owners filing taxes"],
      ur: ["Amazon KDP authors", "Royalty earners", "Non-US LLC owners jo tax file karte hain"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'Amazon takes 30% of your royalties. Stop it.'",
        "Day 2: Explain tax treaty savings.",
        "Day 3: Join KDP and royalty groups.",
        "Day 4: Carousel — ITIN vs EIN.",
        "Day 5: Case study — author saved $X.",
        "Day 6: Q&A story.",
        "Day 7: CTA bundle.",
      ],
      ur: [
        "Day 1: Post — 'Amazon aap ki royalties ka 30% rakh leti hai. Rok dein.'",
        "Day 2: Tax treaty saving bayan karein.",
        "Day 3: KDP aur royalty groups join karein.",
        "Day 4: Carousel — ITIN vs EIN.",
        "Day 5: Case study — author ne $X bachaye.",
        "Day 6: Q&A story.",
        "Day 7: CTA bundle.",
      ],
    },
    thirtyDayPlan: {
      en: [
        "Week 1: Awareness for KDP authors.",
        "Week 2: Educate on tax treaty.",
        "Week 3: Convert with case studies.",
        "Week 4: Referral push.",
      ],
      ur: [
        "Week 1: KDP authors mein awareness.",
        "Week 2: Tax treaty educate karein.",
        "Week 3: Case studies se convert karein.",
        "Week 4: Referral push.",
      ],
    },
    dailyTasks: {
      en: ["1 post", "Engage in author groups", "Reply to DMs", "1 follow-up"],
      ur: ["1 post", "Author groups mein engage karein", "DMs ka jawab", "1 follow-up"],
    },
    postingSchedule: {
      en: ["Mon: Pain", "Tue: Education", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Pain", "Tue: Education", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Pain-first (30% withholding).", "Speak to authors and royalty earners directly."],
      ur: ["Pain pehle (30% withholding).", "Authors aur royalty earners se seedha baat karein."],
    },
    followUpStrategy: {
      en: ["Day 1: send savings calculator.", "Day 7: case study.", "Day 14: limited offer."],
      ur: ["Day 1: savings calculator bhejein.", "Day 7: case study.", "Day 14: limited offer."],
    },
  }),
  P({
    slug: "vat",
    name: "VAT Registration",
    audience: {
      en: ["UK LTDs running ads", "Amazon UK sellers", "B2B agencies", "SaaS"],
      ur: ["UK LTDs jo ads chalati hain", "Amazon UK sellers", "B2B agencies", "SaaS"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — '20% back on every ad pound.'",
        "Day 2: VAT 101 carousel.",
        "Day 3: Engage in UK e-com / agency groups.",
        "Day 4: Myth — 'VAT makes you expensive.'",
        "Day 5: Case study reclaim.",
        "Day 6: Offer + bundle.",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'Har ad pound par 20% wapas.'",
        "Day 2: VAT 101 carousel.",
        "Day 3: UK e-com aur agency groups mein engage karein.",
        "Day 4: Myth — 'VAT mehnga banati hai.'",
        "Day 5: Reclaim case study.",
        "Day 6: Offer aur bundle.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: [
        "Week 1: Awareness.",
        "Week 2: Educate on reclaim.",
        "Week 3: Convert with case studies.",
        "Week 4: Pair with accountancy referrals.",
      ],
      ur: [
        "Week 1: Awareness.",
        "Week 2: Reclaim educate.",
        "Week 3: Case studies se convert.",
        "Week 4: Accountancy referrals pair karein.",
      ],
    },
    dailyTasks: {
      en: ["1 post", "Engage in 2 groups", "Reply DMs", "1 follow-up"],
      ur: ["1 post", "2 groups mein engage", "DMs ka jawab", "1 follow-up"],
    },
    postingSchedule: {
      en: ["Mon: Reclaim", "Tue: Myth", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Reclaim", "Tue: Myth", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Sell reclaim + credibility.", "Pair with UK LTD owners running ads."],
      ur: ["Reclaim aur credibility bechein.", "UK LTD owners ke saath pair karein jo ads chalate hain."],
    },
    followUpStrategy: {
      en: ["Day 1: send VAT savings PDF.", "Day 7: case study.", "Day 14: nudge with bundle."],
      ur: ["Day 1: VAT savings PDF.", "Day 7: case study.", "Day 14: bundle nudge."],
    },
  }),
  P({
    slug: "payoneer",
    name: "Payoneer",
    audience: {
      en: ["Freelancers (Upwork/Fiverr)", "Marketplace sellers", "Agencies receiving global payouts"],
      ur: ["Freelancers (Upwork/Fiverr)", "Marketplace sellers", "Agencies jo global payouts leti hain"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'Stop losing 5% on every payout.'",
        "Day 2: Reel — Payoneer in 60s.",
        "Day 3: Join freelance + marketplace groups.",
        "Day 4: FAQ on fees and approval.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'Har payout par 5% loss band karein.'",
        "Day 2: Reel — Payoneer 60 second mein.",
        "Day 3: Freelance aur marketplace groups join.",
        "Day 4: Fees aur approval ki FAQ.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: ["Week 1: Awareness", "Week 2: Education", "Week 3: Conversion", "Week 4: Referral push"],
      ur: ["Week 1: Awareness", "Week 2: Education", "Week 3: Conversion", "Week 4: Referral push"],
    },
    dailyTasks: {
      en: ["1 post", "5 engagements", "Reply DMs", "1 follow-up"],
      ur: ["1 post", "5 engagements", "DMs ka jawab", "1 follow-up"],
    },
    postingSchedule: {
      en: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Marketplace-first.", "Bundle with freelance courses / mentors."],
      ur: ["Marketplace-first.", "Freelance mentors ke saath bundle."],
    },
    followUpStrategy: {
      en: ["Day 1: send signup link.", "Day 3: approval tips.", "Day 7: nudge."],
      ur: ["Day 1: signup link.", "Day 3: approval tips.", "Day 7: nudge."],
    },
  }),
  P({
    slug: "wise",
    name: "Wise Business",
    audience: {
      en: ["UK LTDs", "US LLCs", "Agencies in multi-currency"],
      ur: ["UK LTDs", "US LLCs", "Multi-currency agencies"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'Banks rob you on FX. Wise gives you the real rate.'",
        "Day 2: Reel — open Wise in 1 week.",
        "Day 3: Join UK LTD / US LLC groups.",
        "Day 4: Rejection-fix carousel.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'Banks FX par loot rahe hain. Wise asli rate deti hai.'",
        "Day 2: Reel — Wise 1 week mein open karein.",
        "Day 3: UK LTD aur US LLC groups join.",
        "Day 4: Rejection-fix carousel.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: ["Week 1: Awareness", "Week 2: Approval tips", "Week 3: Conversion", "Week 4: Cross-sell to Stripe"],
      ur: ["Week 1: Awareness", "Week 2: Approval tips", "Week 3: Conversion", "Week 4: Stripe cross-sell"],
    },
    dailyTasks: {
      en: ["1 post", "Engage", "DMs", "Follow-ups"],
      ur: ["1 post", "Engagement", "DMs", "Follow-ups"],
    },
    postingSchedule: {
      en: ["Mon: FX pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: FX pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Pair with UK LTD/US LLC.", "Focus on approval-on-first-try."],
      ur: ["UK LTD aur US LLC ke saath pair.", "First-try approval par focus."],
    },
    followUpStrategy: {
      en: ["Day 1: send checklist.", "Day 3: send approval guide.", "Day 7: nudge."],
      ur: ["Day 1: checklist.", "Day 3: approval guide.", "Day 7: nudge."],
    },
  }),
  P({
    slug: "airwallex",
    name: "Airwallex",
    audience: {
      en: ["Scaling e-com", "SaaS", "Media buyers"],
      ur: ["Scaling e-com", "SaaS", "Media buyers"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'Burning Wise cards on Meta ads? Switch.'",
        "Day 2: Reel — virtual cards explained.",
        "Day 3: Join media buyer + ecom groups.",
        "Day 4: Comparison carousel (Wise vs Airwallex).",
        "Day 5: Case study.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'Wise card Meta ads pe ban ho jata hai? Switch karein.'",
        "Day 2: Reel — virtual cards explain.",
        "Day 3: Media buyer aur ecom groups join.",
        "Day 4: Wise vs Airwallex carousel.",
        "Day 5: Case study.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: ["Week 1: Awareness", "Week 2: Education", "Week 3: Conversion", "Week 4: Referral push"],
      ur: ["Week 1: Awareness", "Week 2: Education", "Week 3: Conversion", "Week 4: Referral push"],
    },
    dailyTasks: {
      en: ["1 post", "Engage", "DMs", "Follow-ups"],
      ur: ["1 post", "Engagement", "DMs", "Follow-ups"],
    },
    postingSchedule: {
      en: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Target paid-ads pain.", "Position as upgrade from Wise."],
      ur: ["Paid-ads pain target karein.", "Wise se upgrade ke tor par position."],
    },
    followUpStrategy: {
      en: ["Day 1: send card-issuance guide.", "Day 7: case study.", "Day 14: nudge."],
      ur: ["Day 1: card-issuance guide.", "Day 7: case study.", "Day 14: nudge."],
    },
  }),
  P({
    slug: "worldfirst",
    name: "WorldFirst",
    audience: {
      en: ["Amazon FBA", "eBay", "Walmart sellers", "Shopify exporters"],
      ur: ["Amazon FBA", "eBay", "Walmart sellers", "Shopify exporters"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'Amazon payouts eating margin?'",
        "Day 2: Reel — better FX for sellers.",
        "Day 3: Join Amazon FBA / seller groups.",
        "Day 4: Comparison vs Payoneer.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'Amazon payouts margin kha rahe hain?'",
        "Day 2: Reel — sellers ke liye better FX.",
        "Day 3: Amazon FBA groups join.",
        "Day 4: Payoneer ke saath comparison.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: ["Week 1: Awareness", "Week 2: Education", "Week 3: Conversion", "Week 4: Referral"],
      ur: ["Week 1: Awareness", "Week 2: Education", "Week 3: Conversion", "Week 4: Referral"],
    },
    dailyTasks: {
      en: ["1 post", "Engage seller groups", "DMs", "Follow-ups"],
      ur: ["1 post", "Seller groups engagement", "DMs", "Follow-ups"],
    },
    postingSchedule: {
      en: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Seller-only messaging.", "Bundle with Amazon coaches."],
      ur: ["Sirf sellers ko target karein.", "Amazon coaches ke saath bundle."],
    },
    followUpStrategy: {
      en: ["Day 1: send setup guide.", "Day 7: case study.", "Day 14: nudge."],
      ur: ["Day 1: setup guide.", "Day 7: case study.", "Day 14: nudge."],
    },
  }),
  P({
    slug: "stripe",
    name: "Stripe",
    audience: {
      en: ["SaaS", "Agencies", "Coaches", "E-com"],
      ur: ["SaaS", "Agencies", "Coaches", "E-com"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'No Stripe = no global business.'",
        "Day 2: Reel — get approved on first try.",
        "Day 3: Join SaaS / agency / coach groups.",
        "Day 4: Carousel — top 5 rejection reasons.",
        "Day 5: Case study.",
        "Day 6: CTA (LLC + Stripe bundle).",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'Stripe nahi to global business nahi.'",
        "Day 2: Reel — first try mein approval.",
        "Day 3: SaaS, agency, coach groups join.",
        "Day 4: Top 5 rejection reasons carousel.",
        "Day 5: Case study.",
        "Day 6: CTA — LLC + Stripe bundle.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: ["Week 1: Awareness", "Week 2: Approval education", "Week 3: Bundle offers", "Week 4: Scale referrals"],
      ur: ["Week 1: Awareness", "Week 2: Approval education", "Week 3: Bundle offers", "Week 4: Scale referrals"],
    },
    dailyTasks: {
      en: ["1 post", "Engage 2 groups", "DMs", "Follow-ups"],
      ur: ["1 post", "2 groups engagement", "DMs", "Follow-ups"],
    },
    postingSchedule: {
      en: ["Mon: Why Stripe", "Tue: Benefit", "Wed: Reel", "Thu: Rejection FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Why Stripe", "Tue: Benefit", "Wed: Reel", "Thu: Rejection FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Always bundle with LLC/LTD + Wise/Mercury.", "Speak to rejection pain."],
      ur: ["LLC/LTD + Wise/Mercury ke saath bundle.", "Rejection pain ko address karein."],
    },
    followUpStrategy: {
      en: ["Day 1: send checklist.", "Day 3: send rejection-fix guide.", "Day 7: bundle pricing."],
      ur: ["Day 1: checklist.", "Day 3: rejection-fix guide.", "Day 7: bundle pricing."],
    },
  }),
  P({
    slug: "paypal",
    name: "PayPal Business",
    audience: {
      en: ["Freelancers", "Coaches", "E-com", "Service businesses"],
      ur: ["Freelancers", "Coaches", "E-com", "Service businesses"],
    },
    sevenDayPlan: {
      en: [
        "Day 1: Post — 'Lost a sale because no PayPal? Stop that.'",
        "Day 2: Reel — open PayPal Business.",
        "Day 3: Join freelance + e-com groups.",
        "Day 4: FAQ — avoiding freezes.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
      ur: [
        "Day 1: Post — 'PayPal na hone se sale gayi? Rok dein.'",
        "Day 2: Reel — PayPal Business open karein.",
        "Day 3: Freelance aur e-com groups join.",
        "Day 4: FAQ — freezes se bachna.",
        "Day 5: Testimonial.",
        "Day 6: CTA.",
        "Day 7: Recap.",
      ],
    },
    thirtyDayPlan: {
      en: ["Week 1: Awareness", "Week 2: Freeze-avoidance", "Week 3: Conversion", "Week 4: Referrals"],
      ur: ["Week 1: Awareness", "Week 2: Freeze-avoidance", "Week 3: Conversion", "Week 4: Referrals"],
    },
    dailyTasks: {
      en: ["1 post", "5 engagements", "DMs", "Follow-ups"],
      ur: ["1 post", "5 engagements", "DMs", "Follow-ups"],
    },
    postingSchedule: {
      en: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
      ur: ["Mon: Pain", "Tue: Benefit", "Wed: Reel", "Thu: FAQ", "Fri: Offer", "Sat: Story", "Sun: Recap"],
    },
    promotionStrategy: {
      en: ["Pair with Stripe as second processor.", "Lead with trust at checkout."],
      ur: ["Stripe ke saath second processor.", "Checkout par trust se shuru karein."],
    },
    followUpStrategy: {
      en: ["Day 1: send setup checklist.", "Day 7: send freeze-avoidance tips."],
      ur: ["Day 1: setup checklist.", "Day 7: freeze-avoidance tips."],
    },
  }),
];

export const PLAYBOOK_SLUGS = SERVICE_PLAYBOOKS.map((p) => p.slug);
export function getPlaybook(slug: string): ServicePlaybook | undefined {
  return SERVICE_PLAYBOOKS.find((p) => p.slug === slug);
}

// ============================================================
// CROSS-SERVICE GUIDES (channel & strategy)
// ============================================================

export interface GuideDoc {
  id: string;
  title: { en: string; ur: string };
  sections: { heading: { en: string; ur: string }; points: { en: string[]; ur: string[] } }[];
}

const G = (g: GuideDoc) => g;

export const GROWTH_GUIDES: GuideDoc[] = [
  G({
    id: "facebook-group-strategy",
    title: { en: "Facebook Group Strategy", ur: "Facebook Group Strategy" },
    sections: [
      {
        heading: { en: "Choosing the right groups", ur: "Sahi groups chunna" },
        points: {
          en: [
            "Pick 5-10 active groups per service vertical.",
            "Members > 5,000 and daily posts > 10 = healthy group.",
            "Avoid groups dominated by competitor spam.",
          ],
          ur: [
            "Har service ke liye 5-10 active groups chunein.",
            "5,000+ members aur 10+ daily posts = healthy group.",
            "Aise groups avoid karein jin mein competitor spam ho.",
          ],
        },
      },
      {
        heading: { en: "Engagement first", ur: "Pehle engagement" },
        points: {
          en: [
            "Comment on 10 posts before posting your own.",
            "Answer member questions for 3 days before pitching.",
            "Become a known helpful face — sales follow.",
          ],
          ur: [
            "Apna post karne se pehle 10 posts par comment karein.",
            "3 din member sawalon ka jawab dein, phir pitch karein.",
            "Helpful banein, sales khud aayengi.",
          ],
        },
      },
    ],
  }),
  G({
    id: "group-joining-rules",
    title: { en: "Group Joining Rules", ur: "Group Joining Rules" },
    sections: [
      {
        heading: { en: "Stay safe from Facebook jail", ur: "Facebook jail se bachao" },
        points: {
          en: [
            "Join 3-5 groups per day on new accounts.",
            "Wait 24 hours between joins on the same niche.",
            "Always answer the admin questions honestly.",
            "Never copy-paste the same message into 10 groups.",
          ],
          ur: [
            "Naye accounts par roz 3-5 groups join karein.",
            "Same niche ke groups mein 24 ghante ka gap rakhein.",
            "Admin sawalon ka sach jawab dein.",
            "10 groups mein same message copy-paste mat karein.",
          ],
        },
      },
    ],
  }),
  G({
    id: "lead-generation-guide",
    title: { en: "Lead Generation Guide", ur: "Lead Generation Guide" },
    sections: [
      {
        heading: { en: "Where leads come from", ur: "Leads kahan se aati hain" },
        points: {
          en: [
            "Facebook groups (warm).",
            "DMs from your content (warmest).",
            "WhatsApp circle and referrals (highest converting).",
            "Cold outreach (slow but scalable).",
          ],
          ur: [
            "Facebook groups (warm).",
            "Content se aaye DMs (warmest).",
            "WhatsApp circle aur referrals (highest converting).",
            "Cold outreach (slow lekin scalable).",
          ],
        },
      },
      {
        heading: { en: "Daily lead routine", ur: "Roz ki lead routine" },
        points: {
          en: [
            "5 helpful comments in groups.",
            "1 piece of useful content.",
            "3 personal DMs to warm leads.",
            "Log every conversation in a sheet.",
          ],
          ur: [
            "5 helpful comments groups mein.",
            "1 useful content piece.",
            "3 personal DMs warm leads ko.",
            "Har conversation sheet mein log karein.",
          ],
        },
      },
    ],
  }),
  G({
    id: "whatsapp-promotion",
    title: { en: "WhatsApp Promotion Guide", ur: "WhatsApp Promotion Guide" },
    sections: [
      {
        heading: { en: "Status strategy", ur: "Status strategy" },
        points: {
          en: [
            "Post 2-3 statuses per day, mix value and offer.",
            "Use real screenshots — they convert.",
            "End each status with a clear next step.",
          ],
          ur: [
            "Roz 2-3 statuses post karein, value aur offer mix karein.",
            "Real screenshots use karein — yeh convert karte hain.",
            "Har status ka 1 clear next step ho.",
          ],
        },
      },
      {
        heading: { en: "Broadcast and DM", ur: "Broadcast aur DM" },
        points: {
          en: [
            "Use broadcast lists, never group blasts.",
            "Always personalise the first line.",
            "Never send the same message twice in a week.",
          ],
          ur: [
            "Broadcast lists use karein, groups par blast mat karein.",
            "First line hamesha personalised ho.",
            "1 hafte mein same message dobara mat bhejein.",
          ],
        },
      },
    ],
  }),
  G({
    id: "facebook-promotion",
    title: { en: "Facebook Promotion Guide", ur: "Facebook Promotion Guide" },
    sections: [
      {
        heading: { en: "Profile + page", ur: "Profile aur page" },
        points: {
          en: [
            "Use a clean profile photo and a benefit-led bio.",
            "Pin your best post to the top.",
            "Mix profile, page, and group posts weekly.",
          ],
          ur: [
            "Clean profile photo aur benefit-led bio use karein.",
            "Apni best post pin karein.",
            "Profile, page aur groups weekly mix karein.",
          ],
        },
      },
      {
        heading: { en: "Posting cadence", ur: "Posting cadence" },
        points: {
          en: [
            "1 post per day minimum.",
            "Mix: 40% education, 30% proof, 20% story, 10% offer.",
            "Reply to every comment in 2 hours.",
          ],
          ur: [
            "Roz kam se kam 1 post.",
            "Mix: 40% education, 30% proof, 20% story, 10% offer.",
            "Har comment ka 2 ghante mein jawab.",
          ],
        },
      },
    ],
  }),
  G({
    id: "instagram-promotion",
    title: { en: "Instagram Promotion Guide", ur: "Instagram Promotion Guide" },
    sections: [
      {
        heading: { en: "Reels first", ur: "Reels pehle" },
        points: {
          en: [
            "Reels > carousels > single images on reach.",
            "Hook in 1.5 seconds — text + face.",
            "End every reel with a clear CTA in caption.",
          ],
          ur: [
            "Reels reach mein sab se aage hain.",
            "1.5 second mein hook — text aur face.",
            "Har reel ka caption mein clear CTA ho.",
          ],
        },
      },
      {
        heading: { en: "DM funnel", ur: "DM funnel" },
        points: {
          en: [
            "Use 'comment X to get the guide' to start DMs.",
            "Reply with one question, not a pitch.",
            "Send pricing only after needs are clear.",
          ],
          ur: [
            "'Comment X to get the guide' se DMs start karein.",
            "Pehle 1 sawal poochein, pitch mat karein.",
            "Pricing tabhi bhejein jab needs clear hon.",
          ],
        },
      },
    ],
  }),
  G({
    id: "referral-marketing",
    title: { en: "Referral Marketing Guide", ur: "Referral Marketing Guide" },
    sections: [
      {
        heading: { en: "Make referrals easy", ur: "Referrals aasaan banayein" },
        points: {
          en: [
            "Give a ready-to-send WhatsApp message + link.",
            "Reward both sides (referrer + referee).",
            "Thank publicly when someone refers.",
          ],
          ur: [
            "Ready WhatsApp message aur link dein.",
            "Dono ko reward dein — referrer aur referee.",
            "Public mein thank you karein.",
          ],
        },
      },
      {
        heading: { en: "Who to ask", ur: "Kis se poochein" },
        points: {
          en: [
            "Happy clients in the first 2 weeks of service.",
            "Mentors and peers in your niche.",
            "Past leads who didn't convert (they know others who might).",
          ],
          ur: [
            "Khush clients pehle 2 hafte mein.",
            "Mentors aur niche ke peers.",
            "Past leads jo convert nahi hue (woh dosron ko jaante hain).",
          ],
        },
      },
    ],
  }),
];

export const GUIDE_IDS = GROWTH_GUIDES.map((g) => g.id);
export function getGuide(id: string): GuideDoc | undefined {
  return GROWTH_GUIDES.find((g) => g.id === id);
}

// Coverage metric (used by Marketing Guide UI to show progress).
export const COACH_COVERAGE = {
  services: SERVICE_PLAYBOOKS.length,
  guides: GROWTH_GUIDES.length,
  languages: 2,
} as const;
