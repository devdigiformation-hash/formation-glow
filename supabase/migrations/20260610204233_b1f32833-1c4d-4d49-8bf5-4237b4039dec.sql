
-- Widen ai_quotas.tool CHECK to allow new tool name
ALTER TABLE public.ai_quotas DROP CONSTRAINT IF EXISTS ai_quotas_tool_check;
ALTER TABLE public.ai_quotas ADD CONSTRAINT ai_quotas_tool_check
  CHECK (tool = ANY (ARRAY['smart_rebrand','marketing','image','enhance','smart_agent','image_n8n']));

-- Table
CREATE TABLE public.ai_image_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  prompt text NOT NULL,
  provider text NOT NULL DEFAULT 'pollinations'
    CHECK (provider IN ('pollinations','huggingface','cloudflare')),
  size text NOT NULL DEFAULT '1024x1024',
  request_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  n8n_execution_id text,
  image_url text,
  image_storage_path text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','success','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ai_image_generations TO authenticated;
GRANT ALL ON public.ai_image_generations TO service_role;

ALTER TABLE public.ai_image_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "image_gen_select_own_or_admin"
  ON public.ai_image_generations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "image_gen_insert_self"
  ON public.ai_image_generations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "image_gen_update_admin"
  ON public.ai_image_generations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "image_gen_delete_admin"
  ON public.ai_image_generations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX ai_image_generations_user_created_idx
  ON public.ai_image_generations (user_id, created_at DESC);
CREATE INDEX ai_image_generations_status_created_idx
  ON public.ai_image_generations (status, created_at DESC);

CREATE TRIGGER ai_image_generations_set_updated_at
  BEFORE UPDATE ON public.ai_image_generations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quota rows (tier values allowed: free, premium, admin)
INSERT INTO public.ai_quotas (tier, tool, daily_limit) VALUES
  ('free',    'image_n8n', 10),
  ('premium', 'image_n8n', 10),
  ('admin',   'image_n8n', -1)
ON CONFLICT (tier, tool) DO UPDATE SET daily_limit = EXCLUDED.daily_limit;

-- RPC
CREATE OR REPLACE FUNCTION public.check_image_quota(_user_id uuid)
RETURNS TABLE(allowed boolean, used bigint, daily_limit integer, tier text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_limit integer;
  v_used bigint;
BEGIN
  v_tier := public.user_ai_tier(_user_id);
  SELECT q.daily_limit INTO v_limit FROM public.ai_quotas q
    WHERE q.tier = v_tier AND q.tool = 'image_n8n';
  IF v_limit IS NULL THEN v_limit := 0; END IF;

  SELECT count(*) INTO v_used FROM public.ai_image_generations g
    WHERE g.user_id = _user_id
      AND g.status  = 'success'
      AND g.created_at >= date_trunc('day', now() AT TIME ZONE 'UTC');

  RETURN QUERY SELECT
    (v_limit < 0 OR v_used < v_limit) AS allowed,
    v_used,
    v_limit,
    v_tier;
END;
$$;

REVOKE ALL ON FUNCTION public.check_image_quota(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.check_image_quota(uuid) TO authenticated, service_role;

-- storage.objects RLS for ai-image-generations bucket
CREATE POLICY "ai_img_select_own_or_admin"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'ai-image-generations'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
    )
  );

CREATE POLICY "ai_img_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ai-image-generations'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "ai_img_update_own_or_admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'ai-image-generations'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
    )
  );

CREATE POLICY "ai_img_delete_own_or_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'ai-image-generations'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(),'admin')
    )
  );
