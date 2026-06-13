
-- admin-creatives: read all auth, write admin
CREATE POLICY "ac_read_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'admin-creatives');
CREATE POLICY "ac_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'admin-creatives' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "ac_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'admin-creatives' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "ac_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'admin-creatives' AND public.has_role(auth.uid(),'admin'));

-- generated-creatives: partner-scoped folder = {user_id}/...
CREATE POLICY "gc_partner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'generated-creatives' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "gc_partner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'generated-creatives' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "gc_partner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'generated-creatives' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "gc_partner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'generated-creatives' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));

-- partner-logos: read all auth, write own folder
CREATE POLICY "pl_read_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'partner-logos');
CREATE POLICY "pl_partner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pl_partner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'partner-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "pl_partner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'partner-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
