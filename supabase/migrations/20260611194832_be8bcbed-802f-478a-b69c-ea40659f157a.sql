
-- ============== publishing_guides ==============
CREATE TABLE public.publishing_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  title text NOT NULL,
  best_format text,
  optimal_specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  post_template_md text,
  hashtag_strategy text,
  do_dont_md text,
  examples text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publishing_guides TO authenticated;
GRANT ALL ON public.publishing_guides TO service_role;
ALTER TABLE public.publishing_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pg_select_published" ON public.publishing_guides FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pg_admin_insert" ON public.publishing_guides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pg_admin_update" ON public.publishing_guides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pg_admin_delete" ON public.publishing_guides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_pg_platform ON public.publishing_guides(platform);
CREATE INDEX idx_pg_service ON public.publishing_guides(service_id);
CREATE INDEX idx_pg_status ON public.publishing_guides(status);
CREATE INDEX idx_pg_sort ON public.publishing_guides(sort_order);
CREATE TRIGGER set_updated_at_pg BEFORE UPDATE ON public.publishing_guides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== facebook_ads_guides ==============
CREATE TABLE public.facebook_ads_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  objective text,
  audience_targeting jsonb NOT NULL DEFAULT '{}'::jsonb,
  creative_format text,
  primary_text_template text,
  headline_template text,
  description_template text,
  cta_button text,
  budget_guidance text,
  landing_url_pattern text,
  pixel_event text,
  compliance_notes text,
  status text NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facebook_ads_guides TO authenticated;
GRANT ALL ON public.facebook_ads_guides TO service_role;
ALTER TABLE public.facebook_ads_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fag_select_published" ON public.facebook_ads_guides FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "fag_admin_insert" ON public.facebook_ads_guides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "fag_admin_update" ON public.facebook_ads_guides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "fag_admin_delete" ON public.facebook_ads_guides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_fag_service ON public.facebook_ads_guides(service_id);
CREATE INDEX idx_fag_objective ON public.facebook_ads_guides(objective);
CREATE INDEX idx_fag_status ON public.facebook_ads_guides(status);
CREATE INDEX idx_fag_sort ON public.facebook_ads_guides(sort_order);
CREATE TRIGGER set_updated_at_fag BEFORE UPDATE ON public.facebook_ads_guides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
