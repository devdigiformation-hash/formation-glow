// E-commerce & business-model fit — FAQ knowledge for the
// DigiFormation AI Assistant. Plain text, copy-friendly.

export const ECOMMERCE_FAQS = `
=============================================================
ECOMMERCE & BUSINESS-MODEL FIT — EXPERT KNOWLEDGE
=============================================================

AMAZON FBA
- Best company: UK LTD if selling Amazon UK/EU; US LLC if selling Amazon US (Wyoming is the cheap default).
- Best banking: Payoneer (Amazon-recommended), WorldFirst, PingPong.
- Best gateway: not needed for Amazon — Amazon pays out directly to your receiving account.
- VAT: required for FBA-Europe (warehoused inventory triggers VAT in storage countries).
- DigiFormation fit: UK LTD + UK VAT + Payoneer + Companies House compliance.

SHOPIFY STORE (D2C / brand)
- Best company: depends on customer base. US LLC for US customers, UK LTD for EU/UK customers.
- Best banking: Wise Business + Mercury (if US LLC).
- Best gateway: Stripe + PayPal + Shop Pay (built in).
- Add: clear refund + shipping + privacy policy before applying for Stripe.

DROP-SHIPPING
- High-risk for Stripe unless your store is branded and shipping times are realistic.
- Better path: brand it as a "private label" store; warehouse partial stock; show real reviews.
- Better gateway pairing: Stripe (after warm-up) + PayPal.

DIGITAL SERVICES / AGENCIES
- Best company: UK LTD (global credibility) or US LLC Wyoming (lower cost).
- Best banking: Wise Business + Airwallex for multi-currency invoicing.
- Best gateway: Stripe + PayPal for client invoicing; or invoicing tools (Xero, Wave) connected to Stripe.

FREELANCERS (Upwork, Fiverr, Toptal)
- Often no company needed early. Use Payoneer or Wise to receive.
- When earnings cross ~$30k/year, form UK LTD or US LLC for tax efficiency and credibility.
- Bank: Payoneer + Wise + Grey (region-dependent).

SAAS BUSINESSES
- Best company: US LLC (Wyoming/Delaware) for US customers; UK LTD for EU billing.
- Best banking: Mercury (US) + Wise.
- Best gateway: Stripe Billing (subscriptions), Paddle (handles VAT/sales tax as MoR), Lemon Squeezy.
- Compliance: VAT MOSS / OSS for EU, sales tax thresholds per US state.

ONLINE COURSES / EDUCATION
- Company: UK LTD or US LLC; choose by customer base.
- Gateway: Stripe (primary), PayPal (backup). Lemon Squeezy or Paddle if you want a Merchant of Record to handle taxes.
- Hosting: Teachable, Thinkific, Kajabi — all integrate with Stripe.

MARKETPLACES (you build it)
- Company: usually US LLC + Stripe Connect.
- Banking: Mercury + Wise.
- Compliance: KYC for sellers, payouts via Connect Custom or Express.

QUICK FIT TABLE
Business type        | Company        | Banking         | Gateway
Amazon FBA EU        | UK LTD + VAT   | Payoneer/WorldFirst | (Amazon payout)
Amazon FBA US        | US LLC (WY)    | Payoneer/Mercury    | (Amazon payout)
Shopify US           | US LLC (WY)    | Mercury + Wise   | Stripe + PayPal
Shopify UK/EU        | UK LTD         | Wise Business    | Stripe + PayPal/Mollie
SaaS (global)        | US LLC (WY/DE) | Mercury + Wise   | Stripe / Paddle
Digital agency       | UK LTD         | Wise + Airwallex | Stripe + PayPal
Freelancer           | (later) UK LTD | Payoneer + Wise  | n/a (platform)
Online course        | UK LTD or LLC  | Wise + Mercury   | Stripe / Lemon Squeezy
Crypto / high-risk   | case-by-case   | Nsave/ZionPe     | Crypto rails

DIGIFORMATION ANGLE
- The user usually does NOT know which combo to pick. Your job is to ask 2-3 questions (where do customers live? what's the product? expected volume?) and then recommend one bundle: company + bank + gateway.
- Always end with "Want me to package this with DigiFormation so it's done end-to-end?"
`;
