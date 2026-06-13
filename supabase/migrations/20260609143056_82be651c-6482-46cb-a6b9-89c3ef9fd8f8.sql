
ALTER TABLE public.admin_creatives
  ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  company_name text NOT NULL DEFAULT 'DigiFormation Ltd',
  founder text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  company_logo text,
  light_logo text,
  dark_logo text,
  primary_color text NOT NULL DEFAULT '#22d3ee',
  secondary_color text NOT NULL DEFAULT '#a78bfa',
  accent_color text NOT NULL DEFAULT '#34d399',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_whatsapp text NOT NULL DEFAULT '',
  contact_website text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_settings_select_all_auth"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_settings_admin_insert"
  ON public.admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin_settings_admin_update"
  ON public.admin_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin_settings_admin_delete"
  ON public.admin_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER set_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.admin_settings (
  singleton, company_name, founder, website, email, phone, whatsapp,
  contact_email, contact_phone, contact_whatsapp, contact_website
) VALUES (
  true, 'DigiFormation Ltd', 'Muhammad Haroon',
  'https://www.digiformation.uk', 'info@digiformation.uk',
  '+92 316 446 7464', '+92 316 446 7464',
  'info@digiformation.uk', '+92 316 446 7464',
  '+92 316 446 7464', 'https://www.digiformation.uk'
)
ON CONFLICT (singleton) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;
