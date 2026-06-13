DROP POLICY IF EXISTS "audit_auth_insert" ON public.audit_log;
CREATE POLICY "audit_auth_insert" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id IS NULL OR actor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));