
-- Phase 2.A — Knowledge System Foundation

-- =========================================
-- 1. service_categories
-- =========================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read service_categories"
  ON public.service_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert service_categories"
  ON public.service_categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update service_categories"
  ON public.service_categories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete service_categories"
  ON public.service_categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_service_categories_sort ON public.service_categories (sort_order);

CREATE TRIGGER trg_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 2. services — extend existing table safely
-- =========================================
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS short_desc text,
  ADD COLUMN IF NOT EXISTS long_desc text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS public_url text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS price_from numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_unit text,
  ADD COLUMN IF NOT EXISTS turnaround_days_min int,
  ADD COLUMN IF NOT EXISTS turnaround_days_max int,
  ADD COLUMN IF NOT EXISTS requires_jurisdiction boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Unique index on slug (nullable, only constrains rows that have one)
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug_unique ON public.services (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services (category_id);
CREATE INDEX IF NOT EXISTS idx_services_sort ON public.services (sort_order);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services (status);

-- updated_at trigger (drop-if-exists then create, since trigger has no IF NOT EXISTS)
DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 3. service_packages
-- =========================================
CREATE TABLE IF NOT EXISTS public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  tier text NOT NULL,
  price numeric(10,2),
  currency text NOT NULL DEFAULT 'GBP',
  processing_days text,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_packages TO authenticated;
GRANT ALL ON public.service_packages TO service_role;

ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read service_packages"
  ON public.service_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert service_packages"
  ON public.service_packages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update service_packages"
  ON public.service_packages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete service_packages"
  ON public.service_packages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON public.service_packages (service_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_sort ON public.service_packages (sort_order);

CREATE TRIGGER trg_service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 4. package_features
-- =========================================
CREATE TABLE IF NOT EXISTS public.package_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  label text NOT NULL,
  included boolean NOT NULL DEFAULT true,
  note text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_features TO authenticated;
GRANT ALL ON public.package_features TO service_role;

ALTER TABLE public.package_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read package_features"
  ON public.package_features FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert package_features"
  ON public.package_features FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update package_features"
  ON public.package_features FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete package_features"
  ON public.package_features FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_package_features_package_id ON public.package_features (package_id);
CREATE INDEX IF NOT EXISTS idx_package_features_sort ON public.package_features (sort_order);

CREATE TRIGGER trg_package_features_updated_at
  BEFORE UPDATE ON public.package_features
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
