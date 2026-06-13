// Static, reusable Services Knowledge Database (KD.1).
// Hand-authored content used by Rebrand Studio, Affiliate Assistant (Growth
// Coach), Marketing Guide, and FAQ surfaces. Keeps live pricing/turnaround
// in the DB (services.ts) while standardising sales/marketing copy here.

export interface ServiceKnowledgeEntry {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  requirements: string[];
  processingTime: string;
  commonQuestions: string[];
  commonObjections: string[];
  objectionHandling: { objection: string; answer: string }[];
  targetAudience: string[];
  marketingAngles: string[];
  socialHooks: string[];
  rebrandContext: string;
  assistantContext: string;
  hashtags: string[];
}

const E = (e: ServiceKnowledgeEntry) => e;

export const SERVICES_KB: ServiceKnowledgeEntry[] = [
  E({
    slug: "uk-ltd-formation",
    name: "UK LTD Formation",
    shortDescription: "Register a UK Limited Company from anywhere in the world.",
    fullDescription:
      "Full incorporation of a UK Private Limited Company at Companies House, including company name search, SIC code selection, director and PSC setup, share allocation, and delivery of incorporation certificate, memorandum, and articles. Foreign founders welcome — no UK residency required.",
    benefits: [
      "Globally recognised UK business identity",
      "Limited liability — personal assets protected",
      "Access to UK/EU clients, marketplaces, and payment processors",
      "Low corporation tax for small companies",
      "100% remote setup, no UK visit needed",
    ],
    requirements: [
      "Passport / national ID of each director and shareholder",
      "Residential address of each director (any country)",
      "Proposed company name (we check availability)",
      "Optional: UK business address (we can provide)",
    ],
    processingTime: "Typically 24–48 hours once documents are submitted.",
    commonQuestions: [
      "Can I open a UK LTD without living in the UK?",
      "Do I need a UK address?",
      "Will I get an official Companies House certificate?",
      "Can I add more directors later?",
      "Can I open a UK bank or Wise account with this?",
    ],
    commonObjections: [
      "It sounds expensive.",
      "I'm worried about UK taxes.",
      "I don't understand the paperwork.",
    ],
    objectionHandling: [
      {
        objection: "It sounds expensive.",
        answer:
          "The one-time setup is small compared to the doors it opens — Stripe, Wise, Amazon UK, and global B2B clients all become reachable.",
      },
      {
        objection: "I'm worried about UK taxes.",
        answer:
          "You only pay UK corporation tax on UK-sourced profits, and we guide you on accountant referrals so it stays simple.",
      },
      {
        objection: "I don't understand the paperwork.",
        answer:
          "You don't have to. We handle the filing end-to-end — you just send your ID and approve the name.",
      },
    ],
    targetAudience: [
      "Freelancers wanting a professional brand",
      "E-commerce sellers (Amazon UK, Etsy, Shopify)",
      "Agencies serving Western clients",
      "Startups raising or invoicing internationally",
    ],
    marketingAngles: [
      "Look international, win bigger clients",
      "Get paid in GBP without leaving home",
      "Unlock Stripe, Wise, and Amazon UK",
      "Protect your personal assets with limited liability",
    ],
    socialHooks: [
      "You don't need a UK passport to own a UK company.",
      "Most freelancers lose Western clients because they look local. Fix that in 48 hours.",
      "A UK LTD costs less than one month of office rent — and lasts forever.",
    ],
    rebrandContext:
      "Position UK LTD Formation as the fastest credibility upgrade for a freelancer or small business — remote, 24–48 hours, unlocks Stripe/Wise/Amazon. Avoid legal jargon; lead with outcomes (clients, payments, trust).",
    assistantContext:
      "When a partner asks about UK LTD, emphasise: remote setup, 24–48h turnaround, no UK residency, unlocks global payments. Recommend pairing with UK Business Address + Wise.",
    hashtags: ["#UKCompany", "#UKLTD", "#StartupPakistan", "#FreelancerLife", "#GoGlobal", "#DigiFormation"],
  }),
  E({
    slug: "ltd-id-verification",
    name: "LTD ID Verification",
    shortDescription: "Complete the new mandatory Companies House identity verification.",
    fullDescription:
      "Guided completion of the Companies House identity verification now required for UK company directors and PSCs. We walk you through the approved verifier flow, document checks, and confirmation filing so your company stays compliant.",
    benefits: [
      "Stay compliant with new UK ECCTA rules",
      "Avoid filing blocks and director restrictions",
      "Done remotely — no UK travel",
      "One-time process, lifetime compliance benefit",
    ],
    requirements: [
      "Valid passport or government-issued photo ID",
      "Selfie / live biometric capture",
      "Companies House authentication code (we help retrieve)",
    ],
    processingTime: "Usually completed in 1–3 working days.",
    commonQuestions: [
      "Is this really mandatory now?",
      "Can my old LTD continue without verification?",
      "What if my ID fails the check?",
      "Do all directors need to verify?",
    ],
    commonObjections: [
      "I already have a UK LTD — why do I need this?",
      "I'm worried about sharing my passport online.",
    ],
    objectionHandling: [
      {
        objection: "I already have a UK LTD — why do I need this?",
        answer:
          "Under the new Economic Crime Act, every director and PSC must verify identity — even on existing companies. Skipping it can block your filings.",
      },
      {
        objection: "I'm worried about sharing my passport online.",
        answer:
          "Verification runs through Companies House approved providers using bank-grade encryption. We never store your ID ourselves.",
      },
    ],
    targetAudience: ["Existing UK LTD owners", "New incorporators", "Overseas directors of UK companies"],
    marketingAngles: [
      "Don't let your UK company get suspended",
      "New UK law — verify before the deadline",
      "Stay compliant, keep filing freely",
    ],
    socialHooks: [
      "If you own a UK LTD and haven't verified your ID yet — you're on borrowed time.",
      "Companies House just changed the rules. Here's what every director must do.",
    ],
    rebrandContext:
      "Frame as urgent compliance, not a sales pitch. Reassure on data safety. Pair naturally with new UK LTD Formation buyers.",
    assistantContext:
      "Use a helpful, slightly urgent tone. Emphasise: legally required, fast, remote. Never alarm — always offer a clear next step.",
    hashtags: ["#CompaniesHouse", "#UKCompliance", "#ECCTA", "#UKLTD", "#DigiFormation"],
  }),
  E({
    slug: "uk-business-address",
    name: "UK Business Address",
    shortDescription: "A real London business address for your company and mail.",
    fullDescription:
      "Prestigious UK business address service usable as Registered Office, Director's Service Address, and Business Trading Address. Includes mail scanning and forwarding so you never miss official Companies House or HMRC letters.",
    benefits: [
      "Professional London presence",
      "Privacy — keep your home address off public record",
      "Mail scanning emailed to you",
      "Required for many UK bank and Stripe applications",
    ],
    requirements: ["Active or pending UK LTD", "Basic KYC (passport + address proof)"],
    processingTime: "Activated same day after KYC approval.",
    commonQuestions: [
      "Can I use it as my Registered Office?",
      "Do you forward physical mail?",
      "Is the address central London?",
      "Can I use it for Stripe and Wise verification?",
    ],
    commonObjections: ["My home address works fine.", "Why pay monthly?"],
    objectionHandling: [
      {
        objection: "My home address works fine.",
        answer:
          "Your home address becomes public on Companies House forever. A London address protects your privacy and looks far more credible to clients.",
      },
      {
        objection: "Why pay monthly?",
        answer:
          "You're buying a London presence and mail handling — cheaper than one coffee a week and instantly upgrades how clients see you.",
      },
    ],
    targetAudience: ["Remote founders", "Freelancers", "E-commerce sellers", "Agencies"],
    marketingAngles: [
      "Get a London address without London rent",
      "Protect your privacy from public records",
      "Look like a real UK business overnight",
    ],
    socialHooks: [
      "Your home address on Google forever? There's a better way.",
      "Real London office, zero London rent.",
    ],
    rebrandContext:
      "Sell the prestige + privacy combo. Always pair with UK LTD or LTD ID Verification clients.",
    assistantContext:
      "Recommend whenever a partner mentions privacy, mail, Stripe rejection, or bank account setup.",
    hashtags: ["#LondonAddress", "#UKBusiness", "#RegisteredOffice", "#RemoteFounder", "#DigiFormation"],
  }),
  E({
    slug: "us-llc-formation",
    name: "US LLC Formation",
    shortDescription: "Form a US LLC remotely — Wyoming, Delaware, or New Mexico.",
    fullDescription:
      "End-to-end US LLC incorporation including state filing, registered agent, EIN application support, and operating agreement. Designed for non-US founders selling to the US market or running global SaaS, e-commerce, or agency businesses.",
    benefits: [
      "Sell to US customers with a US legal entity",
      "Access Stripe US, PayPal US, Amazon US",
      "Strong asset protection",
      "Pass-through taxation (no US tax on foreign-earned income, in most cases)",
    ],
    requirements: [
      "Passport copy",
      "Address (any country)",
      "Preferred company name",
      "Choice of state (we advise)",
    ],
    processingTime: "Filing in 1–5 business days depending on state.",
    commonQuestions: [
      "Which state is best for me?",
      "Do I need to visit the US?",
      "Will I owe US tax?",
      "Can I get an EIN with this?",
    ],
    commonObjections: [
      "US taxes scare me.",
      "I already have a UK LTD — do I need both?",
    ],
    objectionHandling: [
      {
        objection: "US taxes scare me.",
        answer:
          "Most non-US owners with no US presence pay zero US federal income tax on foreign-sourced income. We guide you on the simple annual filings.",
      },
      {
        objection: "I already have a UK LTD — do I need both?",
        answer:
          "A US LLC unlocks Stripe US, PayPal US, and US marketplaces — markets a UK LTD often can't access cleanly. Many partners run both.",
      },
    ],
    targetAudience: ["SaaS founders", "E-commerce sellers (Amazon US, Shopify US)", "Agencies", "Affiliate marketers"],
    marketingAngles: [
      "Sell to US clients like a local",
      "Unlock Stripe US and PayPal US",
      "Pay 0% US tax on foreign income (with proper structure)",
    ],
    socialHooks: [
      "You can own a US company without ever stepping in the US.",
      "Stripe US + PayPal US in under a week. Here's how.",
    ],
    rebrandContext:
      "Lead with market access (US customers, US payments). Avoid heavy tax claims — always say 'we guide you' rather than 'no tax'.",
    assistantContext:
      "Recommend US LLC for: SaaS, agencies, US dropshipping, Amazon US sellers, anyone needing Stripe US.",
    hashtags: ["#USLLC", "#Wyoming", "#Delaware", "#StripeUS", "#GlobalBusiness", "#DigiFormation"],
  }),
  E({
    slug: "ein-number",
    name: "EIN Number",
    shortDescription: "Get your US Employer Identification Number for your LLC or Corp.",
    fullDescription:
      "Direct application to the IRS for an Employer Identification Number (EIN) — required to open US bank accounts, Stripe US, PayPal US, and to file US tax returns. For non-US founders we handle the SS-4 fax/online process end-to-end.",
    benefits: [
      "Open Stripe US, PayPal US, Mercury, Relay",
      "File US tax returns",
      "Hire US contractors",
      "Required for almost every US payment processor",
    ],
    requirements: ["Existing US LLC or Corporation", "Passport copy of responsible party"],
    processingTime: "Typically 1–4 weeks (IRS dependent). Expedited paths possible.",
    commonQuestions: [
      "Do I need an SSN to get an EIN?",
      "Can I get one without forming a company?",
      "How long does the IRS really take?",
    ],
    commonObjections: ["I heard the IRS is slow.", "Can I just use my LLC without one?"],
    objectionHandling: [
      {
        objection: "I heard the IRS is slow.",
        answer:
          "We use the fastest legal channel available to non-US founders and follow up until it lands — you don't have to chase anyone.",
      },
      {
        objection: "Can I just use my LLC without one?",
        answer:
          "No. Stripe, PayPal, banks, and the IRS all require an EIN. Without it, your LLC is essentially unusable for payments.",
      },
    ],
    targetAudience: ["New US LLC owners", "Founders applying to Stripe/PayPal/Mercury"],
    marketingAngles: ["The key that unlocks every US payment processor", "No SSN required"],
    socialHooks: ["No SSN? You can still get a US EIN.", "Your LLC is useless until you have this number."],
    rebrandContext: "Always bundle with US LLC unless partner already has one. Set realistic IRS timing expectations.",
    assistantContext:
      "If a partner asks 'how do I open Stripe US' — the answer almost always includes EIN first.",
    hashtags: ["#EIN", "#IRS", "#USLLC", "#StripeUS", "#DigiFormation"],
  }),
  E({
    slug: "itin-number",
    name: "ITIN Number",
    shortDescription: "US Individual Taxpayer Identification Number for non-US persons.",
    fullDescription:
      "Application support for an IRS ITIN — used by non-US individuals to file US tax returns, claim treaty benefits, open certain US accounts, and verify identity on platforms like Amazon KDP, Stripe Atlas, and PayPal.",
    benefits: [
      "File US tax returns as a non-resident",
      "Claim tax treaty benefits (lower withholding)",
      "Verify on Amazon KDP, royalties platforms, brokerage accounts",
    ],
    requirements: ["Certified passport copy", "Reason for ITIN (we help select)", "Sometimes: federal tax return"],
    processingTime: "IRS processing 8–14 weeks typically.",
    commonQuestions: [
      "Is ITIN the same as EIN?",
      "Do I need an ITIN if I have an LLC?",
      "Can I use it for a US bank account?",
    ],
    commonObjections: ["It takes too long.", "I don't really need to file US taxes."],
    objectionHandling: [
      {
        objection: "It takes too long.",
        answer:
          "True — that's why we start early and use a Certified Acceptance route where possible to avoid mailing your real passport.",
      },
      {
        objection: "I don't really need to file US taxes.",
        answer:
          "Many platforms (Amazon KDP, royalty payers, brokers) withhold 30% without an ITIN. Filing once can save you thousands.",
      },
    ],
    targetAudience: ["Authors (Amazon KDP)", "Royalty earners", "US brokerage users", "Non-US owners of US LLCs"],
    marketingAngles: ["Stop losing 30% to US withholding", "Tax treaty savings for non-US earners"],
    socialHooks: ["Amazon is keeping 30% of your royalties. Get this number and stop it."],
    rebrandContext: "Lead with concrete withholding savings, not tax jargon.",
    assistantContext: "Suggest ITIN when partner mentions Amazon KDP, US royalties, or 30% withholding.",
    hashtags: ["#ITIN", "#AmazonKDP", "#USroyalties", "#TaxTreaty", "#DigiFormation"],
  }),
  E({
    slug: "vat-registration",
    name: "VAT Registration",
    shortDescription: "Register your UK company for VAT — voluntarily or at the threshold.",
    fullDescription:
      "Full UK VAT registration with HMRC, including selection of the right scheme (Standard, Flat Rate, or Cash Accounting), submission, and post-registration guidance on invoicing and filing.",
    benefits: [
      "Reclaim VAT on UK purchases and ads",
      "Appear larger and more credible to B2B clients",
      "Required when turnover passes £90k",
      "Mandatory for some Amazon UK and EU flows",
    ],
    requirements: ["Active UK LTD", "Estimated turnover", "Business activity description", "UK business address"],
    processingTime: "Usually 2–4 weeks from HMRC.",
    commonQuestions: [
      "Do I have to register?",
      "Which scheme is best for me?",
      "Can a non-UK resident own a VAT-registered company?",
    ],
    commonObjections: [
      "VAT will make me more expensive.",
      "It sounds like more accounting work.",
    ],
    objectionHandling: [
      {
        objection: "VAT will make me more expensive.",
        answer:
          "For B2B clients, VAT is neutral — they reclaim it. For agencies and SaaS selling B2B, it actually adds credibility.",
      },
      {
        objection: "It sounds like more accounting work.",
        answer:
          "Modern tools like Xero and FreeAgent automate it. We can refer an accountant who handles filings for less than a monthly Netflix bill.",
      },
    ],
    targetAudience: ["UK LTD owners selling B2B", "Amazon UK sellers", "Agencies", "SaaS"],
    marketingAngles: ["Reclaim VAT on every ad pound", "Look enterprise-ready to UK buyers"],
    socialHooks: ["If your UK LTD spends on Meta ads, you're throwing away 20% by not registering for VAT."],
    rebrandContext: "Focus on credibility + reclaim, not threshold panic.",
    assistantContext: "Recommend voluntary VAT for partners running paid ads or selling B2B.",
    hashtags: ["#VAT", "#HMRC", "#UKLTD", "#B2B", "#DigiFormation"],
  }),

  // ============ BANKING / PAYMENTS ============
  E({
    slug: "payoneer",
    name: "Payoneer Account",
    shortDescription: "Receive international payments from marketplaces and clients.",
    fullDescription:
      "Guided Payoneer account opening for freelancers and businesses. Get USD, EUR, GBP receiving accounts, withdraw locally, and receive payments from Upwork, Fiverr, Amazon, and direct clients.",
    benefits: [
      "Multi-currency receiving accounts (USD, EUR, GBP, more)",
      "Withdraw to local bank in PKR",
      "Accepted by all major marketplaces",
      "Issue requests / pay vendors globally",
    ],
    requirements: ["Government ID", "Proof of address", "Business or freelance details"],
    processingTime: "Approval typically 1–3 business days.",
    commonQuestions: [
      "Can freelancers in Pakistan use Payoneer?",
      "What are the withdrawal fees?",
      "Does it work with Upwork and Fiverr?",
    ],
    commonObjections: ["The fees feel high.", "I already use Wise."],
    objectionHandling: [
      {
        objection: "The fees feel high.",
        answer:
          "Payoneer's edge is acceptance — many platforms (Amazon, Upwork) pay Payoneer directly without conversions, which often nets cheaper than wire transfers.",
      },
      {
        objection: "I already use Wise.",
        answer:
          "Most pros run both — Wise for client invoicing, Payoneer for marketplace payouts. They complement each other.",
      },
    ],
    targetAudience: ["Freelancers", "Amazon sellers", "Marketplace earners", "Agencies"],
    marketingAngles: ["Get paid by Amazon, Upwork, Fiverr in one place", "Withdraw to your local bank in PKR"],
    socialHooks: ["Stop losing 5% to bank conversions. Open this instead."],
    rebrandContext: "Pair with marketplace selling angles. Don't overpromise on fees.",
    assistantContext: "Recommend Payoneer first when partner mentions marketplaces.",
    hashtags: ["#Payoneer", "#FreelancePakistan", "#GetPaidGlobally", "#DigiFormation"],
  }),
  E({
    slug: "wise",
    name: "Wise Business Account",
    shortDescription: "Multi-currency business account with real exchange rates.",
    fullDescription:
      "Wise Business account opening support for UK LTDs and US LLCs. Hold 40+ currencies, get local account details (USD ACH, GBP sort code, EUR IBAN), and pay/get paid like a local in each market.",
    benefits: [
      "Real mid-market FX rates",
      "Local account numbers in USD, GBP, EUR, AUD, more",
      "Issue debit cards for spend control",
      "Direct integration with Xero / QuickBooks",
    ],
    requirements: ["UK LTD or US LLC", "Director ID + selfie", "Proof of business activity"],
    processingTime: "Usually approved in 2–7 business days.",
    commonQuestions: ["Can a Pakistani-owned UK LTD open Wise?", "Are there monthly fees?", "Does it support Stripe payouts?"],
    commonObjections: ["My application got rejected before."],
    objectionHandling: [
      {
        objection: "My application got rejected before.",
        answer:
          "Most rejections come from weak business descriptions or missing proof. We pre-vet your application so it passes the first time.",
      },
    ],
    targetAudience: ["UK LTD owners", "US LLC owners", "Agencies invoicing in multiple currencies"],
    marketingAngles: ["Save 4-6% on every cross-border payment", "Get local account details in 5 countries"],
    socialHooks: ["Banks are robbing you on FX. Wise gives you the real rate."],
    rebrandContext: "Always pair with UK LTD or US LLC formation funnels.",
    assistantContext: "Default banking recommendation for any freshly formed UK LTD / US LLC.",
    hashtags: ["#Wise", "#MulticurrencyAccount", "#UKLTD", "#USLLC", "#DigiFormation"],
  }),
  E({
    slug: "airwallex",
    name: "Airwallex Business Account",
    shortDescription: "Global business account built for scaling e-commerce and SaaS.",
    fullDescription:
      "Airwallex application support for UK LTDs, US LLCs, HK and SG entities. Multi-currency wallets, virtual cards, expense management, and merchant acquiring in supported regions.",
    benefits: [
      "Multi-currency accounts in 20+ currencies",
      "Issue unlimited virtual cards for ad spend",
      "Strong for e-commerce and SaaS scaling",
      "FX often cheaper at higher volumes",
    ],
    requirements: ["Eligible business entity", "Director KYC", "Website + business model details"],
    processingTime: "Typically 3–10 business days.",
    commonQuestions: ["Is Airwallex available for my country?", "How does it compare to Wise?"],
    commonObjections: ["Wise already works for me."],
    objectionHandling: [
      {
        objection: "Wise already works for me.",
        answer:
          "Airwallex shines for higher volumes, ad-spend cards, and merchant acquiring — many scaling brands use both side by side.",
      },
    ],
    targetAudience: ["Scaling e-commerce brands", "SaaS", "Ad agencies"],
    marketingAngles: ["Unlimited virtual cards for ad spend", "Built for scale, not freelancers"],
    socialHooks: ["Burning your Wise card on Meta ads? Switch to this."],
    rebrandContext: "Position as the 'next step up' from Wise for partners scaling ads or e-comm.",
    assistantContext: "Recommend Airwallex for partners with ad spend or e-com volume.",
    hashtags: ["#Airwallex", "#Ecommerce", "#SaaS", "#GlobalBusiness", "#DigiFormation"],
  }),
  E({
    slug: "worldfirst",
    name: "WorldFirst Account",
    shortDescription: "Marketplace-focused multi-currency account for sellers.",
    fullDescription:
      "WorldFirst account onboarding for Amazon, eBay, Walmart, and Shopify sellers. Collect marketplace payouts in local currency and convert at competitive rates.",
    benefits: ["Direct Amazon / eBay / Walmart payouts", "Competitive FX", "Strong support for marketplace sellers"],
    requirements: ["Business entity", "Marketplace seller account", "Director KYC"],
    processingTime: "3–7 business days typically.",
    commonQuestions: ["Does it work with Amazon US/UK/EU?", "How does it compare to Payoneer?"],
    commonObjections: ["I already use Payoneer."],
    objectionHandling: [
      {
        objection: "I already use Payoneer.",
        answer:
          "WorldFirst often beats Payoneer on FX for larger payouts — many serious sellers split payouts to optimise.",
      },
    ],
    targetAudience: ["Amazon FBA sellers", "eBay sellers", "Walmart sellers", "Shopify exporters"],
    marketingAngles: ["Marketplace payouts, better FX", "Built for sellers, not freelancers"],
    socialHooks: ["Amazon payouts eating your margin? There's a better receiver."],
    rebrandContext: "Always frame for marketplace sellers, not general freelancers.",
    assistantContext: "Suggest when partner mentions Amazon/eBay/Walmart payouts.",
    hashtags: ["#WorldFirst", "#AmazonFBA", "#Ecommerce", "#DigiFormation"],
  }),
  E({
    slug: "pingpong",
    name: "PingPong Account",
    shortDescription: "Cross-border receiving and payouts for global sellers.",
    fullDescription:
      "PingPong account support — multi-currency receiving accounts, marketplace payouts, supplier payments, and VAT services in some regions.",
    benefits: ["Receive USD, EUR, GBP, JPY and more", "Marketplace payouts supported", "Supplier payments in CNY"],
    requirements: ["Business entity", "Director KYC", "Marketplace or business proof"],
    processingTime: "3–7 business days typically.",
    commonQuestions: ["Does it support Chinese supplier payments?", "Which marketplaces are supported?"],
    commonObjections: ["I haven't heard of it."],
    objectionHandling: [
      {
        objection: "I haven't heard of it.",
        answer:
          "PingPong is a leader for sellers sourcing from China — competitive FX and direct CNY supplier rails.",
      },
    ],
    targetAudience: ["Amazon sellers sourcing from China", "Cross-border sellers"],
    marketingAngles: ["Pay Chinese suppliers in CNY direct", "Marketplace payouts + supplier payments in one place"],
    socialHooks: ["Sourcing from China? You're overpaying on supplier transfers."],
    rebrandContext: "Lead with China-sourcing angle.",
    assistantContext: "Recommend when partner mentions Alibaba, 1688, or Chinese suppliers.",
    hashtags: ["#PingPong", "#AmazonFBA", "#ChinaSourcing", "#DigiFormation"],
  }),
  E({
    slug: "sunrate",
    name: "Sunrate Account",
    shortDescription: "Enterprise-grade FX and payments for growing businesses.",
    fullDescription:
      "Sunrate account onboarding for businesses needing competitive FX, mass payouts, and corporate cards across multiple currencies.",
    benefits: ["Competitive FX for higher volumes", "Mass payout support", "Corporate cards"],
    requirements: ["Established business entity", "KYC documentation", "Business activity proof"],
    processingTime: "5–15 business days typically.",
    commonQuestions: ["What volume do I need?", "Is it available in my country?"],
    commonObjections: ["I'm too small for this."],
    objectionHandling: [
      {
        objection: "I'm too small for this.",
        answer:
          "Even small agencies running ads benefit from Sunrate's FX once monthly spend passes a few thousand dollars.",
      },
    ],
    targetAudience: ["Mid-sized e-commerce", "Agencies", "B2B exporters"],
    marketingAngles: ["Cheaper FX at scale", "Enterprise payments without enterprise pricing"],
    socialHooks: ["Spending $5k+/month on ads? You're leaving FX savings on the table."],
    rebrandContext: "Position as 'upgrade path' for scaling partners.",
    assistantContext: "Recommend when partner reports high monthly spend.",
    hashtags: ["#Sunrate", "#Fintech", "#ScalingBusiness", "#DigiFormation"],
  }),
  E({
    slug: "stripe",
    name: "Stripe Account",
    shortDescription: "Accept card payments globally with the world's best processor.",
    fullDescription:
      "Stripe account opening support for UK LTDs and US LLCs. We help pass KYC, fix common rejections, and configure your account for subscriptions, one-time payments, and marketplaces.",
    benefits: [
      "Accept Visa, Mastercard, Amex worldwide",
      "Subscriptions, invoicing, Connect marketplaces",
      "Best developer ecosystem in payments",
      "Fast, daily payouts",
    ],
    requirements: ["UK LTD or US LLC", "Business website", "Bank account (Wise / Mercury / Relay)", "Director KYC"],
    processingTime: "Account approval often same-day after submission; full activation may need a few days.",
    commonQuestions: [
      "Can a non-US founder open Stripe US?",
      "What if Stripe rejects my application?",
      "Do I need a website?",
    ],
    commonObjections: ["I tried before and got rejected."],
    objectionHandling: [
      {
        objection: "I tried before and got rejected.",
        answer:
          "Stripe rejections usually come from country mismatch, weak websites, or unclear business descriptions. We fix each of these before submission.",
      },
    ],
    targetAudience: ["SaaS", "Agencies", "E-commerce", "Coaches and creators"],
    marketingAngles: ["Charge clients in any currency", "Subscriptions on autopilot", "The processor every serious business uses"],
    socialHooks: ["No Stripe = no global business. Here's how to get approved on the first try."],
    rebrandContext: "Always pair with UK LTD / US LLC + Wise/Mercury combos.",
    assistantContext: "Top-priority recommendation for SaaS, agencies, coaches.",
    hashtags: ["#Stripe", "#StripeUS", "#StripeUK", "#OnlinePayments", "#DigiFormation"],
  }),
  E({
    slug: "paypal",
    name: "PayPal Business Account",
    shortDescription: "Trusted global checkout option your customers already use.",
    fullDescription:
      "PayPal Business account opening guidance — including unfreezing tips, country setup, and linking to UK/US business entities for clean payouts.",
    benefits: ["Recognised by billions of buyers", "Trust factor at checkout", "Multi-currency receiving"],
    requirements: ["Business entity", "Bank account", "Government ID"],
    processingTime: "Usually approved in 1–3 business days.",
    commonQuestions: ["Can I open PayPal Business as a Pakistani founder?", "Will my account get frozen?"],
    commonObjections: ["I've heard PayPal freezes accounts."],
    objectionHandling: [
      {
        objection: "I've heard PayPal freezes accounts.",
        answer:
          "Freezes usually come from sudden volume spikes or chargebacks. We coach you on safe ramp-up and dispute handling to avoid this.",
      },
    ],
    targetAudience: ["Freelancers", "Coaches", "E-commerce", "Service businesses"],
    marketingAngles: ["Add the world's most trusted checkout button", "Win clients who only pay via PayPal"],
    socialHooks: ["Lost a sale because you didn't offer PayPal? Don't lose the next one."],
    rebrandContext: "Pair with Stripe as the 'second processor' for trust at checkout.",
    assistantContext: "Recommend alongside Stripe — never replace Stripe with PayPal alone.",
    hashtags: ["#PayPal", "#OnlinePayments", "#Ecommerce", "#DigiFormation"],
  }),
  E({
    slug: "taptap",
    name: "TapTap Send Account",
    shortDescription: "Send money home fast with low fees.",
    fullDescription:
      "TapTap Send onboarding — mobile-first remittance to Pakistan and other corridors with strong rates and quick delivery.",
    benefits: ["Low fees on remittances", "Fast delivery to local banks/mobile wallets", "Mobile-first UX"],
    requirements: ["ID", "Sender bank or card", "Recipient details"],
    processingTime: "Setup in minutes; transfers usually same-day.",
    commonQuestions: ["Which countries are supported?", "Is the rate really better than Western Union?"],
    commonObjections: ["I trust my existing remittance app."],
    objectionHandling: [
      {
        objection: "I trust my existing remittance app.",
        answer:
          "Run a side-by-side test on your next transfer — the rate and fee difference is usually obvious within one send.",
      },
    ],
    targetAudience: ["Freelancers sending earnings home", "Expats", "Family senders"],
    marketingAngles: ["Better rate, smaller fee, same trust", "Skip the Western Union queue"],
    socialHooks: ["You're losing PKR on every Western Union transfer. Try this."],
    rebrandContext: "Personal/remittance angle, not B2B.",
    assistantContext: "Recommend when partner asks about getting money home cheaply.",
    hashtags: ["#TapTapSend", "#Remittance", "#PakistanFreelancer", "#DigiFormation"],
  }),
  E({
    slug: "wallester",
    name: "Wallester Cards",
    shortDescription: "Issue branded virtual and physical cards for your business.",
    fullDescription:
      "Wallester account setup for businesses needing scalable card issuance — virtual cards for ad spend, employee cards, and SaaS subscriptions, with full control and reporting.",
    benefits: ["Unlimited virtual cards", "Real-time controls and limits", "Strong for ad spend and SaaS stacks"],
    requirements: ["Eligible business entity", "KYC", "Funding source"],
    processingTime: "Onboarding 3–10 business days.",
    commonQuestions: ["Can I issue cards in USD/EUR?", "Are physical cards available?"],
    commonObjections: ["My Wise card is enough."],
    objectionHandling: [
      {
        objection: "My Wise card is enough.",
        answer:
          "One card = one point of failure. With Wallester you can issue a card per ad account, per VA, per project — full control.",
      },
    ],
    targetAudience: ["Media buyers", "Agencies", "E-commerce ops"],
    marketingAngles: ["A card per ad account", "Ban one card, not your whole business"],
    socialHooks: ["Meta banned your card? Issue a new one in 30 seconds."],
    rebrandContext: "Sell as scale + safety tool, not a basic debit card.",
    assistantContext: "Recommend for partners running paid ads at any volume.",
    hashtags: ["#Wallester", "#VirtualCards", "#MediaBuying", "#DigiFormation"],
  }),
  E({
    slug: "grey",
    name: "Grey Account",
    shortDescription: "Foreign bank accounts for freelancers — USD, EUR, GBP.",
    fullDescription:
      "Grey account onboarding for freelancers and remote workers, providing personal USD, EUR, and GBP receiving accounts with conversion to local currency.",
    benefits: ["Personal USD/EUR/GBP account details", "Receive client payments like a local", "Convert to PKR easily"],
    requirements: ["Government ID", "Selfie", "Freelancer or remote work proof"],
    processingTime: "Usually 1–3 business days.",
    commonQuestions: ["Is it really free?", "Does it work for Upwork/Fiverr?"],
    commonObjections: ["I don't trust new fintech apps."],
    objectionHandling: [
      {
        objection: "I don't trust new fintech apps.",
        answer:
          "Grey is licensed in multiple jurisdictions and used by thousands of African and Asian freelancers — start small to test.",
      },
    ],
    targetAudience: ["Freelancers", "Remote workers", "Digital nomads"],
    marketingAngles: ["Get a US account number as a freelancer", "Skip Payoneer fees on small payments"],
    socialHooks: ["You don't need a US LLC to get a US account number."],
    rebrandContext: "Personal-freelancer angle. Don't conflate with business accounts.",
    assistantContext: "Recommend for solo freelancers who don't yet need a UK LTD/US LLC.",
    hashtags: ["#Grey", "#FreelancePakistan", "#GetPaidGlobally", "#DigiFormation"],
  }),

  // ============ DIGITAL SERVICES ============
  E({
    slug: "website-development",
    name: "Website Development",
    shortDescription: "Professional, conversion-focused websites that win clients.",
    fullDescription:
      "Custom website design and development — from one-page founder sites to full e-commerce and SaaS platforms. Built mobile-first with SEO, speed, and conversions in mind.",
    benefits: [
      "Mobile-first, fast-loading design",
      "SEO-ready structure",
      "Conversion-focused copy and layout",
      "CMS so you can edit yourself",
    ],
    requirements: ["Brand basics (name, logo, colors)", "Content or content brief", "Examples you like"],
    processingTime: "Typically 2–4 weeks depending on scope.",
    commonQuestions: ["Do I need to provide the content?", "Will I be able to edit it myself?", "Is hosting included?"],
    commonObjections: ["I can build one on Wix myself.", "It costs too much."],
    objectionHandling: [
      {
        objection: "I can build one on Wix myself.",
        answer:
          "You can — and most DIY sites convert poorly. We design for the client decision, not the drag-and-drop.",
      },
      {
        objection: "It costs too much.",
        answer:
          "One client won from a credible site usually pays back the build. Without one, every cold lead is a coin flip.",
      },
    ],
    targetAudience: ["Agencies", "Coaches", "Local businesses", "SaaS founders"],
    marketingAngles: ["A site that closes clients while you sleep", "Stop losing leads to ugly sites"],
    socialHooks: ["Your website is your 24/7 salesperson. Is yours sleeping on the job?"],
    rebrandContext: "Lead with conversions and credibility — not features.",
    assistantContext: "Recommend whenever a partner says their site is old, slow, or 'just on social'.",
    hashtags: ["#WebDevelopment", "#WebDesign", "#ConversionDesign", "#DigiFormation"],
  }),
  E({
    slug: "seo-services",
    name: "SEO Services",
    shortDescription: "Rank on Google and bring in clients on autopilot.",
    fullDescription:
      "Full-funnel SEO — technical audit, on-page optimisation, content strategy, and authority building. Focused on commercial keywords that bring actual buyers, not vanity traffic.",
    benefits: [
      "Compounding free traffic",
      "Lower cost-per-lead than ads over time",
      "Long-term brand authority",
      "Targets buyers searching with intent",
    ],
    requirements: ["Live website", "Access to analytics / search console", "Clarity on services and target markets"],
    processingTime: "First wins in 2–3 months; meaningful results in 4–8 months.",
    commonQuestions: ["How long until I rank?", "Do you guarantee rankings?", "Will I need to write content?"],
    commonObjections: ["SEO is too slow.", "Ads are faster."],
    objectionHandling: [
      {
        objection: "SEO is too slow.",
        answer:
          "Slow to start, then free forever. Ads stop the day you stop paying. The best businesses run both.",
      },
      {
        objection: "Ads are faster.",
        answer:
          "Yes — and 10× more expensive per lead at scale. SEO compounds while ads burn budget.",
      },
    ],
    targetAudience: ["Agencies", "Local businesses", "SaaS", "E-commerce"],
    marketingAngles: ["Rank once, get leads forever", "Stop renting clients from Meta — own them via Google"],
    socialHooks: ["Every day you wait on SEO, a competitor takes your ranking."],
    rebrandContext: "Frame as long-term moat vs. short-term ad spend.",
    assistantContext: "Recommend for partners with a real site and 3+ month horizon.",
    hashtags: ["#SEO", "#GoogleRankings", "#OrganicGrowth", "#DigiFormation"],
  }),
  E({
    slug: "digital-marketing",
    name: "Digital Marketing",
    shortDescription: "Done-for-you ads and content to grow your business.",
    fullDescription:
      "Full-service digital marketing — Meta, Google, TikTok ads, content creation, landing pages, and funnel optimisation. Tailored to your offer and target market.",
    benefits: [
      "Predictable lead and sales flow",
      "Professional creative and copy",
      "Funnel + ad working together",
      "Weekly reporting and iteration",
    ],
    requirements: ["Clear offer and price", "Landing page or willingness to build one", "Initial ad budget"],
    processingTime: "Launch in 1–2 weeks after onboarding.",
    commonQuestions: ["What budget do I need to start?", "Which platform is best for me?", "How quickly will I see ROI?"],
    commonObjections: [
      "I tried ads before and they didn't work.",
      "I can't afford a marketing agency.",
    ],
    objectionHandling: [
      {
        objection: "I tried ads before and they didn't work.",
        answer:
          "Usually it's not the ads — it's the offer, landing page, or targeting. We fix all three, not just buttons.",
      },
      {
        objection: "I can't afford a marketing agency.",
        answer:
          "We tier the engagement so even smaller businesses can start with strategy + one channel and scale from there.",
      },
    ],
    targetAudience: ["Coaches", "Agencies", "E-commerce", "Local services"],
    marketingAngles: ["Predictable leads, every month", "Stop guessing — start scaling"],
    socialHooks: ["Boosting posts ≠ marketing. Here's what actually works."],
    rebrandContext: "Sell predictability and process, not random tactics.",
    assistantContext: "Recommend when partner mentions 'I need more leads' or 'ads aren't working'.",
    hashtags: ["#DigitalMarketing", "#PerformanceMarketing", "#MetaAds", "#GoogleAds", "#DigiFormation"],
  }),
];

export const SERVICE_SLUGS = SERVICES_KB.map((s) => s.slug);

export function getServiceKnowledge(slug: string): ServiceKnowledgeEntry | undefined {
  return SERVICES_KB.find((s) => s.slug === slug);
}

export function findServiceKnowledgeByName(name: string): ServiceKnowledgeEntry | undefined {
  const n = name.toLowerCase().trim();
  return SERVICES_KB.find(
    (s) => s.name.toLowerCase() === n || s.slug === n || s.name.toLowerCase().includes(n),
  );
}

export function buildServiceAssistantContext(slug: string): string {
  const k = getServiceKnowledge(slug);
  if (!k) return "";
  return [
    `Service: ${k.name}`,
    `Summary: ${k.shortDescription}`,
    `Audience: ${k.targetAudience.join(", ")}`,
    `Top angles: ${k.marketingAngles.slice(0, 3).join(" | ")}`,
    `Coach note: ${k.assistantContext}`,
  ].join("\n");
}

export function buildServiceRebrandContext(slug: string): string {
  const k = getServiceKnowledge(slug);
  if (!k) return "";
  return [
    `Service: ${k.name}`,
    `Positioning: ${k.rebrandContext}`,
    `Benefits: ${k.benefits.slice(0, 4).join(" • ")}`,
    `Hashtags: ${k.hashtags.join(" ")}`,
  ].join("\n");
}
