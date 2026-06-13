## Phase R.7 — Build Brand Manager

Transform `build-brand.tsx` from a single-flow wizard into a **Brand Library Manager** with unlimited saved brands and one Active Brand that drives the rest of the platform.

### 1. Data model (Lovable Cloud)

New table `public.brands`:
- `id`, `partner_id` (auth.users), `name`, `brand_type` (formation/solutions/services/consulting/other)
- `meaning_en`, `meaning_ur`, `theme` (color key), `logo_prompt`, `logo_url` (nullable)
- `facebook_handle`, `instagram_handle`, `tagline`
- `is_active` (bool), `created_at`, `updated_at`
- Partial unique index: only one `is_active = true` per `partner_id`
- RLS: partner owns own rows; grants for authenticated + service_role
- Trigger: when a brand is set active, deactivate the partner's other brands

### 2. Active Brand → Partner Profile sync

A small server function `setActiveBrand(brandId)`:
- flips `is_active`, copies `name → profiles.brand_name`, `logo_url → profiles.logo_url`, `theme → profiles.primary_color/secondary_color`, social handles → `profiles.social_links`.
- Returns updated profile so UI refreshes.

This is the ONLY path that mutates the rest of the platform. Library edits stay isolated.

### 3. Build Brand page rebuild (`src/routes/build-brand.tsx`)

Three sections:
1. **Active Brand** — large card with logo, name, meaning, theme swatch, "Change active brand" CTA.
2. **Brand Library** — grid of saved brand cards. Each card: logo, name, meaning, theme dot, created date, actions: **View**, **Download Bundle**, **Set Active** (or ✓ Active Brand), **Delete** (with confirm dialog).
3. **Create New Brand** — wizard launcher.

### 4. Wizard (10 steps, single dialog/sheet)

1. Brand type
2. Generate 10 names (reuse `generateBrandNames` server fn; pass type)
3. Pick name → show English + Urdu meaning (already returned by `translateBrandMeanings` with `language: "ur"`; call both in parallel after pick)
4. Theme selection (10 swatches)
5. Auto-generate logo prompt from name + theme
6. Open Ideogram + Copy prompt
7. Upload logo (reuses `uploadPartnerLogo` storage path, but stored against brand id)
8. Facebook page instructions (derived from name)
9. Instagram instructions (derived from name)
10. Save → inserts row into `brands`, returns to library

Wizard state lives in component; only final save writes to DB.

### 5. Bundle download

Client-side: build a Markdown/HTML string with all brand fields → trigger download as `.md` (simple, no server). PDF/DOCX deferred — Markdown opens cleanly and matches "downloadable bundle" requirement without heavy deps.

### 6. AI Assistant + other consumers

`smart-agent.functions.ts` already pulls partner profile context. Because Active Brand syncs into `profiles`, the AI Assistant, Rebrand Studio, Marketing Guide, Orders, Earnings automatically use the active brand — no changes needed there. We'll add an "Active Brand: X" line to the system prompt context for clarity.

### 7. Files

- **Migration**: create `brands` table + RLS + GRANTs + unique-active index + activation trigger.
- **New**: `src/lib/brands.functions.ts` — `listBrands`, `createBrand`, `deleteBrand`, `setActiveBrand`.
- **New**: `src/lib/data/use-brands.ts` — React Query hook wrappers.
- **New**: `src/components/brand-card.tsx`, `src/components/brand-wizard.tsx` (extracted from current `build-brand.tsx`).
- **Edit**: `src/routes/build-brand.tsx` — rewrite as Library Manager.
- **Edit**: `src/lib/smart-agent.functions.ts` — inject `Active Brand: <name>` into prompt.

### 8. Out of scope (intentionally)

- PDF/DOCX bundle (Markdown only this phase).
- Per-brand creative library separation (still uses profile-level data; Active sync covers it).
- Brand editing after save (delete + recreate this phase).

Approve to proceed — I'll start with the migration.
