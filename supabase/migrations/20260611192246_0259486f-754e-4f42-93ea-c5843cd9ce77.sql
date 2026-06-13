
-- Phase 2.B — Jurisdictions + Required Documents

-- =========================================
-- 1. jurisdictions
-- =========================================
CREATE TABLE IF NOT EXISTS public.jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  surcharge numeric(10,2),
  currency text NOT NULL DEFAULT 'GBP',
  processing_days text,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jurisdictions TO authenticated;
GRANT ALL ON public.jurisdictions TO service_role;

ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read jurisdictions"
  ON public.jurisdictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert jurisdictions"
  ON public.jurisdictions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update jurisdictions"
  ON public.jurisdictions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete jurisdictions"
  ON public.jurisdictions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_jurisdictions_service_id ON public.jurisdictions (service_id);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_code       ON public.jurisdictions (code);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_status     ON public.jurisdictions (status);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_sort       ON public.jurisdictions (sort_order);

CREATE TRIGGER trg_jurisdictions_updated_at
  BEFORE UPDATE ON public.jurisdictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 2. required_documents
-- =========================================
CREATE TABLE IF NOT EXISTS public.required_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  document_label text NOT NULL,
  applies_to text,
  required boolean NOT NULL DEFAULT true,
  guidance text,
  sort_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.required_documents TO authenticated;
GRANT ALL ON public.required_documents TO service_role;

ALTER TABLE public.required_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read required_documents"
  ON public.required_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert required_documents"
  ON public.required_documents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update required_documents"
  ON public.required_documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete required_documents"
  ON public.required_documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_required_documents_service_id ON public.required_documents (service_id);
CREATE INDEX IF NOT EXISTS idx_required_documents_status     ON public.required_documents (status);
CREATE INDEX IF NOT EXISTS idx_required_documents_sort       ON public.required_documents (sort_order);

CREATE TRIGGER trg_required_documents_updated_at
  BEFORE UPDATE ON public.required_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
