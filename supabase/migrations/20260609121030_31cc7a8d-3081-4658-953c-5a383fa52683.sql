
-- ==============================================================
-- Phase 13 schema: production tables + RLS + realtime + seeds
-- ==============================================================

-- ---------- enums ----------
DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM ('new','contacted','converted','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('new','contacted','in_progress','waiting_documents','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.commission_status AS ENUM ('pending','approved','delayed','paid','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payout_method AS ENUM ('manual_bank_transfer','paypal','wise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================
-- services (catalog)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  commission_amount_gbp numeric(10,2) NOT NULL DEFAULT 20,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_select_all_auth" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "services_admin_write"     ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "services_admin_update"    ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "services_admin_delete"    ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ==============================================================
-- manual_leads
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.manual_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_whatsapp text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name_snapshot text NOT NULL DEFAULT '',
  quoted_price_gbp numeric(10,2),
  notes text NOT NULL DEFAULT '',
  status public.lead_status NOT NULL DEFAULT 'new',
  estimated_commission_gbp numeric(10,2) NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manual_leads TO authenticated;
GRANT ALL ON public.manual_leads TO service_role;
ALTER TABLE public.manual_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_partner_select" ON public.manual_leads FOR SELECT TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "leads_partner_insert" ON public.manual_leads FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "leads_partner_update" ON public.manual_leads FOR UPDATE TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "leads_admin_delete"   ON public.manual_leads FOR DELETE TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_manual_leads_updated_at BEFORE UPDATE ON public.manual_leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================
-- orders
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.manual_leads(id) ON DELETE SET NULL,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name_snapshot text NOT NULL DEFAULT '',
  client_name text NOT NULL DEFAULT '',
  client_whatsapp text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  status public.order_status NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  partner_visible_notes text NOT NULL DEFAULT '',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_partner_select" ON public.orders FOR SELECT TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_admin_insert"   ON public.orders FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_admin_update"   ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_admin_delete"   ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================
-- commissions
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.manual_leads(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  amount_gbp numeric(10,2) NOT NULL DEFAULT 0,
  status public.commission_status NOT NULL DEFAULT 'pending',
  payout_method public.payout_method,
  paid_at timestamptz,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions_partner_select" ON public.commissions FOR SELECT TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "commissions_admin_insert"   ON public.commissions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "commissions_admin_update"   ON public.commissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "commissions_admin_delete"   ON public.commissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================
-- admin_creatives (global library)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.admin_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  service_name text NOT NULL DEFAULT '',
  image_url text,
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_creatives TO authenticated;
GRANT ALL ON public.admin_creatives TO service_role;
ALTER TABLE public.admin_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_creatives_select_all_auth" ON public.admin_creatives FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_creatives_admin_insert"    ON public.admin_creatives FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_creatives_admin_update"    ON public.admin_creatives FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_creatives_admin_delete"    ON public.admin_creatives FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_admin_creatives_updated_at BEFORE UPDATE ON public.admin_creatives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================
-- generated_creatives (partner-scoped)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.generated_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_creative_id uuid REFERENCES public.admin_creatives(id) ON DELETE SET NULL,
  output_image_url text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'generic',
  size text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_creatives TO authenticated;
GRANT ALL ON public.generated_creatives TO service_role;
ALTER TABLE public.generated_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gencre_partner_select" ON public.generated_creatives FOR SELECT TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gencre_partner_insert" ON public.generated_creatives FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());
CREATE POLICY "gencre_partner_update" ON public.generated_creatives FOR UPDATE TO authenticated USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());
CREATE POLICY "gencre_partner_delete" ON public.generated_creatives FOR DELETE TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_generated_creatives_updated_at BEFORE UPDATE ON public.generated_creatives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================
-- downloads (partner-scoped, append-only)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creative_id uuid,
  file_type text NOT NULL DEFAULT 'other',
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "downloads_partner_select" ON public.downloads FOR SELECT TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "downloads_partner_insert" ON public.downloads FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());

-- ==============================================================
-- ai_usage (partner-scoped)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text NOT NULL DEFAULT '',
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_partner_select" ON public.ai_usage FOR SELECT TO authenticated USING (partner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ai_usage_partner_insert" ON public.ai_usage FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());

-- ==============================================================
-- audit_log (append-only)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_label text NOT NULL DEFAULT 'system',
  action text NOT NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_select"  ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_auth_insert"   ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================================
-- realtime
-- ==============================================================
ALTER TABLE public.manual_leads REPLICA IDENTITY FULL;
ALTER TABLE public.orders        REPLICA IDENTITY FULL;
ALTER TABLE public.commissions   REPLICA IDENTITY FULL;
ALTER TABLE public.services           REPLICA IDENTITY FULL;
ALTER TABLE public.admin_creatives    REPLICA IDENTITY FULL;
ALTER TABLE public.generated_creatives REPLICA IDENTITY FULL;
ALTER TABLE public.downloads          REPLICA IDENTITY FULL;
ALTER TABLE public.ai_usage           REPLICA IDENTITY FULL;
ALTER TABLE public.audit_log          REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.manual_leads;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_creatives;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_creatives;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.downloads;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_usage;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================
-- seed services catalog
-- ==============================================================
INSERT INTO public.services (name, category, description, commission_amount_gbp) VALUES
  ('UK LTD Formation','Company Formation','Companies House registration, ready in 24 hours.',20),
  ('ID Verification','Compliance','Identity & address verification for KYC / AML.',5),
  ('UK Compliance','Compliance','Confirmation statements, filings & ongoing compliance.',20),
  ('USA LLC Formation','Company Formation','Delaware, Wyoming or Florida LLC with EIN.',20),
  ('Business Banking','Banking','Multi-currency business accounts, fast onboarding.',20),
  ('Stripe Setup','Payments','Stripe onboarding, live processing in 48 hours.',20),
  ('PayPal Setup','Payments','PayPal business approval & verification.',20),
  ('Wise Business','Banking','Multi-currency Wise Business account setup.',20),
  ('Website Development','Digital','Conversion-focused websites launched in 14 days.',20)
ON CONFLICT (name) DO NOTHING;
