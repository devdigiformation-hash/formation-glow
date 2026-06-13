
-- ============== banking_payment_partners ==============
CREATE TABLE public.banking_payment_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  provider_slug text UNIQUE NOT NULL,
  name text NOT NULL,
  logo_url text,
  supported_countries text[] NOT NULL DEFAULT '{}',
  supported_company_types text[] NOT NULL DEFAULT '{}',
  typical_approval_days text,
  account_type text,
  setup_fee numeric(10,2),
  currency text DEFAULT 'GBP',
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  common_rejection_reasons text[] NOT NULL DEFAULT '{}',
  documents_needed text[] NOT NULL DEFAULT '{}',
  notes_md text,
  status text NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_payment_partners TO authenticated;
GRANT ALL ON public.banking_payment_partners TO service_role;
ALTER TABLE public.banking_payment_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bpp_select_published" ON public.banking_payment_partners FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bpp_admin_insert" ON public.banking_payment_partners FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bpp_admin_update" ON public.banking_payment_partners FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bpp_admin_delete" ON public.banking_payment_partners FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_bpp_service ON public.banking_payment_partners(service_id);
CREATE INDEX idx_bpp_status ON public.banking_payment_partners(status);
CREATE INDEX idx_bpp_sort ON public.banking_payment_partners(sort_order);
CREATE INDEX idx_bpp_countries ON public.banking_payment_partners USING GIN(supported_countries);
CREATE INDEX idx_bpp_company_types ON public.banking_payment_partners USING GIN(supported_company_types);
CREATE TRIGGER set_updated_at_bpp BEFORE UPDATE ON public.banking_payment_partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== marketing_angles ==============
CREATE TABLE public.marketing_angles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  angle text NOT NULL,
  audience text,
  pain_point text,
  promise text,
  proof text,
  cta text,
  tone text,
  channels text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_angles TO authenticated;
GRANT ALL ON public.marketing_angles TO service_role;
ALTER TABLE public.marketing_angles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ma_select_published" ON public.marketing_angles FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ma_admin_insert" ON public.marketing_angles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ma_admin_update" ON public.marketing_angles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ma_admin_delete" ON public.marketing_angles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_ma_service ON public.marketing_angles(service_id);
CREATE INDEX idx_ma_status ON public.marketing_angles(status);
CREATE INDEX idx_ma_sort ON public.marketing_angles(sort_order);
CREATE INDEX idx_ma_channels ON public.marketing_angles USING GIN(channels);
CREATE TRIGGER set_updated_at_ma BEFORE UPDATE ON public.marketing_angles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== keywords ==============
CREATE TABLE public.keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  intent text,
  match_type text,
  locale text NOT NULL DEFAULT 'en-GB',
  volume_band text,
  notes text,
  status text NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.keywords TO authenticated;
GRANT ALL ON public.keywords TO service_role;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kw_select_published" ON public.keywords FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "kw_admin_insert" ON public.keywords FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "kw_admin_update" ON public.keywords FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "kw_admin_delete" ON public.keywords FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_kw_service ON public.keywords(service_id);
CREATE INDEX idx_kw_keyword ON public.keywords(keyword);
CREATE INDEX idx_kw_intent ON public.keywords(intent);
CREATE INDEX idx_kw_match_type ON public.keywords(match_type);
CREATE INDEX idx_kw_locale ON public.keywords(locale);
CREATE INDEX idx_kw_status ON public.keywords(status);
CREATE TRIGGER set_updated_at_kw BEFORE UPDATE ON public.keywords
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
