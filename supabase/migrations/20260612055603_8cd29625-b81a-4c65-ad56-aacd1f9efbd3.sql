
ALTER TABLE public.generated_creatives
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS cta text,
  ADD COLUMN IF NOT EXISTS external_prompt text,
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS style_version text NOT NULL DEFAULT 'v1';

CREATE INDEX IF NOT EXISTS idx_generated_creatives_service_id
  ON public.generated_creatives(service_id);
CREATE INDEX IF NOT EXISTS idx_generated_creatives_partner_created
  ON public.generated_creatives(partner_id, created_at DESC);
