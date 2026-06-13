
-- Brand Library: partners can save unlimited brands; one active at a time.
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_type TEXT NOT NULL DEFAULT 'formation',
  meaning_en TEXT,
  meaning_ur TEXT,
  theme TEXT NOT NULL DEFAULT 'blue',
  logo_prompt TEXT,
  logo_url TEXT,
  facebook_handle TEXT,
  instagram_handle TEXT,
  tagline TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners view own brands" ON public.brands
  FOR SELECT TO authenticated USING (auth.uid() = partner_id);
CREATE POLICY "Partners insert own brands" ON public.brands
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = partner_id);
CREATE POLICY "Partners update own brands" ON public.brands
  FOR UPDATE TO authenticated USING (auth.uid() = partner_id) WITH CHECK (auth.uid() = partner_id);
CREATE POLICY "Partners delete own brands" ON public.brands
  FOR DELETE TO authenticated USING (auth.uid() = partner_id);

-- Only one active brand per partner.
CREATE UNIQUE INDEX brands_one_active_per_partner
  ON public.brands(partner_id) WHERE is_active = true;

CREATE INDEX brands_partner_created_idx
  ON public.brands(partner_id, created_at DESC);

CREATE TRIGGER brands_set_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
