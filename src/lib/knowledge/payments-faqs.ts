// Payment gateways — FAQ knowledge for the DigiFormation AI Assistant.
// Plain text, copy-friendly.

export const PAYMENTS_FAQS = `
=============================================================
PAYMENT GATEWAYS — EXPERT KNOWLEDGE (per provider)
=============================================================

GENERAL RULES
- Gateway availability depends on (a) where your company is registered (b) what you sell (c) volume.
- Most card processors block high-risk: adult, crypto, supplements, gambling, drop-shipping (case by case), forex training.
- A clean website + clear refund/T&Cs + business email + matching company name speeds approval dramatically.

------------------------------------------------------------
STRIPE
------------------------------------------------------------
- Supported countries: 40+, including UK, US, EU, AU, CA, SG, HK, AE.
- Non-resident path: UK LTD + UK bank (Wise Business OK) OR US LLC + EIN + US bank (Mercury OK).
- Pricing (typical UK/US): 1.5% + 20p domestic cards, ~2.5% + 20p international.
- Strong: subscriptions, SaaS billing, marketplaces (Connect), strong API.
- Verification needs: company docs, director ID, business model, website.
- Common rejections: drop-shipping from generic stores, no refund policy, mismatched legal name.

------------------------------------------------------------
PAYPAL BUSINESS
------------------------------------------------------------
- Country eligibility: 200+ markets.
- Account types: Personal / Business / Pro.
- Tip: open the PayPal Business account in the SAME country as your company + bank to avoid limitations.
- Fees: ~2.9-4.4% + fixed fee for cross-border.
- Best for: backup processor next to Stripe, marketplaces, freelancers receiving from clients abroad.
- Common limitations: 21-day fund hold for new accounts, sudden reserves on growing accounts — keep refund rate low.

------------------------------------------------------------
TAPTAP SEND / TAPTAP (regional)
------------------------------------------------------------
- Money-transfer / payout platform popular in MENA and South Asia.
- Not a card gateway — useful for paying contractors, families, partners.
- Best for: agencies disbursing payouts to creators or remote staff in unbanked regions.

------------------------------------------------------------
WALLESTER
------------------------------------------------------------
- Estonian card-issuing platform (Visa principal member).
- Issues physical + virtual cards under your brand (BIN sponsorship).
- Best for: agencies/marketplaces wanting branded prepaid cards for staff or end users.
- Not a consumer checkout gateway — it's an issuing platform.

------------------------------------------------------------
GREY
------------------------------------------------------------
- USD/EUR/GBP virtual accounts for freelancers in Africa / South Asia.
- Receive from Upwork, Fiverr, Deel; spend with a virtual USD card.
- Best for: freelancers without access to local USD banking.

------------------------------------------------------------
MOLLIE
------------------------------------------------------------
- European payment processor (Netherlands HQ).
- Strong on iDEAL, SEPA, Bancontact, Klarna, Apple Pay, cards.
- Eligibility: EU/UK business preferred. Excellent for EU e-commerce.
- Fees vary by method, typically very competitive for SEPA/iDEAL.

------------------------------------------------------------
WHICH GATEWAY FOR WHICH BUSINESS?
------------------------------------------------------------
- SaaS subscriptions, global card payments → Stripe (primary) + PayPal (backup).
- EU-focused e-commerce → Mollie + PayPal.
- US/UK e-commerce → Stripe + PayPal.
- Marketplace paying creators → PayPal Payouts, TapTap, Grey, Wallester (branded cards).
- Freelancer receiving from platforms → Payoneer, Wise, Grey, TapTap.

SETUP CHECKLIST (any card gateway)
1. Live website with: about, contact, refund, terms, privacy.
2. Business email on the same domain.
3. Company docs + director ID matching the account name.
4. Bank account in the same legal entity.
5. Clear product description and pricing on the site.
6. SSL + checkout flow that matches what you described.

COMMON REJECTION REASONS
- Generic Shopify store with AliExpress products and no brand.
- Domain registered <30 days with no traffic or socials.
- Mismatch between company country and processor target country.
- Restricted vertical (CBD, adult, FX education, crypto exchange).

DIGIFORMATION ANGLE
- We package: company + bank + gateway → so the partner gets ONE compliant setup that actually gets approved.
- We tell partners HONESTLY when a vertical will not pass, instead of failing 5 applications.
`;
