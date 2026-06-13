
-- TABLE 1: partner_terms
CREATE TABLE public.partner_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.service_packages(id) ON DELETE CASCADE,
  partner_tier text DEFAULT 'standard',
  b2b_price numeric(10,2),
  currency text DEFAULT 'GBP',
  commission_pct numeric(5,2),
  commission_flat numeric(10,2),
  payout_cadence text DEFAULT 'per_order',
  min_payout numeric(10,2),
  notes_admin text,
  active_from timestamptz DEFAULT now(),
  active_to timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_terms TO authenticated;
GRANT ALL ON public.partner_terms TO service_role;
ALTER TABLE public.partner_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin select partner_terms" ON public.partner_terms FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert partner_terms" ON public.partner_terms FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update partner_terms" ON public.partner_terms FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete partner_terms" ON public.partner_terms FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_partner_terms_service_id ON public.partner_terms(service_id);
CREATE INDEX idx_partner_terms_package_id ON public.partner_terms(package_id);
CREATE INDEX idx_partner_terms_partner_tier ON public.partner_terms(partner_tier);
CREATE INDEX idx_partner_terms_status ON public.partner_terms(status);
CREATE INDEX idx_partner_terms_active_from ON public.partner_terms(active_from);
CREATE INDEX idx_partner_terms_active_to ON public.partner_terms(active_to);
CREATE TRIGGER trg_partner_terms_updated_at BEFORE UPDATE ON public.partner_terms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TABLE 2: brand_assets
CREATE TABLE public.brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner text NOT NULL,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL,
  label text NOT NULL,
  value text,
  file_url text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_assets TO authenticated;
GRANT ALL ON public.brand_assets TO service_role;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select brand_assets" ON public.brand_assets FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (owner = 'digiformation' AND status = 'active')
    OR (owner = 'partner' AND partner_id = auth.uid())
  );
CREATE POLICY "Insert brand_assets" ON public.brand_assets FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (owner = 'partner' AND partner_id = auth.uid())
  );
CREATE POLICY "Update brand_assets" ON public.brand_assets FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (owner = 'partner' AND partner_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (owner = 'partner' AND partner_id = auth.uid())
  );
CREATE POLICY "Delete brand_assets" ON public.brand_assets FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (owner = 'partner' AND partner_id = auth.uid())
  );
CREATE INDEX idx_brand_assets_owner ON public.brand_assets(owner);
CREATE INDEX idx_brand_assets_partner_id ON public.brand_assets(partner_id);
CREATE INDEX idx_brand_assets_kind ON public.brand_assets(kind);
CREATE INDEX idx_brand_assets_status ON public.brand_assets(status);
CREATE TRIGGER trg_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TABLE 3: owner_data_requests
CREATE TABLE public.owner_data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  item text NOT NULL,
  status text DEFAULT 'open',
  priority text DEFAULT 'medium',
  requested_at timestamptz DEFAULT now(),
  provided_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owner_data_requests TO authenticated;
GRANT ALL ON public.owner_data_requests TO service_role;
ALTER TABLE public.owner_data_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin select owner_data_requests" ON public.owner_data_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert owner_data_requests" ON public.owner_data_requests FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update owner_data_requests" ON public.owner_data_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete owner_data_requests" ON public.owner_data_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_owner_data_requests_category ON public.owner_data_requests(category);
CREATE INDEX idx_owner_data_requests_status ON public.owner_data_requests(status);
CREATE INDEX idx_owner_data_requests_priority ON public.owner_data_requests(priority);
CREATE TRIGGER trg_owner_data_requests_updated_at BEFORE UPDATE ON public.owner_data_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FUNCTION: get_my_terms()
CREATE OR REPLACE FUNCTION public.get_my_terms()
RETURNS TABLE (
  service_id uuid,
  package_id uuid,
  partner_tier text,
  commission_pct numeric,
  commission_flat numeric,
  payout_cadence text,
  min_payout numeric,
  currency text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pt.service_id,
    pt.package_id,
    pt.partner_tier,
    pt.commission_pct,
    pt.commission_flat,
    pt.payout_cadence,
    pt.min_payout,
    pt.currency,
    pt.status
  FROM public.partner_terms pt
  WHERE pt.status = 'active'
    AND (pt.active_from IS NULL OR pt.active_from <= now())
    AND (pt.active_to IS NULL OR pt.active_to > now())
    AND auth.uid() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_my_terms() FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_terms() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_terms() TO service_role;
