
-- ============== faqs ==============
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  question text NOT NULL,
  answer_md text,
  source_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_select_published_authenticated"
  ON public.faqs FOR SELECT TO authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "faqs_admin_insert"
  ON public.faqs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "faqs_admin_update"
  ON public.faqs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "faqs_admin_delete"
  ON public.faqs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_published ON public.faqs(published);
CREATE INDEX idx_faqs_sort_order ON public.faqs(sort_order);

CREATE TRIGGER faqs_set_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== faq_services ==============
CREATE TABLE public.faq_services (
  faq_id uuid NOT NULL REFERENCES public.faqs(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (faq_id, service_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_services TO authenticated;
GRANT ALL ON public.faq_services TO service_role;

ALTER TABLE public.faq_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_services_select_authenticated"
  ON public.faq_services FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "faq_services_admin_insert"
  ON public.faq_services FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "faq_services_admin_update"
  ON public.faq_services FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "faq_services_admin_delete"
  ON public.faq_services FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_faq_services_faq_id ON public.faq_services(faq_id);
CREATE INDEX idx_faq_services_service_id ON public.faq_services(service_id);

-- ============== content_library ==============
CREATE TABLE public.content_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  url text,
  summary text,
  hero_image_url text,
  service_ids uuid[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  published_at date,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_library TO authenticated;
GRANT ALL ON public.content_library TO service_role;

ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_library_select_published_authenticated"
  ON public.content_library FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "content_library_admin_insert"
  ON public.content_library FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "content_library_admin_update"
  ON public.content_library FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "content_library_admin_delete"
  ON public.content_library FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_content_library_type ON public.content_library(type);
CREATE INDEX idx_content_library_status ON public.content_library(status);
CREATE INDEX idx_content_library_published_at ON public.content_library(published_at);
CREATE INDEX idx_content_library_service_ids ON public.content_library USING GIN (service_ids);
CREATE INDEX idx_content_library_keywords ON public.content_library USING GIN (keywords);

CREATE TRIGGER content_library_set_updated_at
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
