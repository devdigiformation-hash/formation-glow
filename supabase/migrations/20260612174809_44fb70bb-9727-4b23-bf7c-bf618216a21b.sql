
-- 1. profiles: restrict reads to owner + admin
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. admin_settings: admin-only SELECT, public-safe view for partners
DROP POLICY IF EXISTS admin_settings_select_all_auth ON public.admin_settings;
CREATE POLICY admin_settings_admin_select
  ON public.admin_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE VIEW public.admin_settings_public
WITH (security_invoker = true) AS
SELECT id, company_name, founder, website, email, phone, whatsapp,
       company_logo, light_logo, dark_logo,
       primary_color, secondary_color, accent_color,
       contact_email, contact_phone, contact_whatsapp, contact_website
FROM public.admin_settings
WHERE singleton = true;

-- View needs a permissive read path; underlying table SELECT is admin-only,
-- so wrap reads in a SECURITY DEFINER function instead of granting on the view.
REVOKE ALL ON public.admin_settings_public FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_settings_public()
RETURNS public.admin_settings_public
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.admin_settings_public LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_admin_settings_public() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_settings_public() TO authenticated;

-- 3. audit_log: remove partner INSERT, admin-only writes
DROP POLICY IF EXISTS audit_auth_insert ON public.audit_log;
CREATE POLICY audit_admin_insert
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND actor_id = auth.uid()
  );

-- 4. Revoke anon EXECUTE on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.get_my_terms() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_ai_quota(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_image_quota(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_ai_tier(uuid) FROM anon, PUBLIC;
