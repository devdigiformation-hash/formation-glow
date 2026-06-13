-- Grants (B1)
GRANT SELECT, INSERT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
GRANT SELECT ON public.ai_quotas TO authenticated;
GRANT ALL ON public.ai_quotas TO service_role;

-- Loosen INSERT policy for observability
DROP POLICY IF EXISTS ai_usage_partner_insert ON public.ai_usage;
DROP POLICY IF EXISTS ai_usage_self_insert ON public.ai_usage;
CREATE POLICY ai_usage_self_insert ON public.ai_usage
  FOR INSERT TO authenticated
  WITH CHECK (partner_id = auth.uid());

-- Extend allowed tools to include smart_agent
ALTER TABLE public.ai_quotas DROP CONSTRAINT ai_quotas_tool_check;
ALTER TABLE public.ai_quotas ADD CONSTRAINT ai_quotas_tool_check
  CHECK (tool = ANY (ARRAY['smart_rebrand','marketing','image','enhance','smart_agent']));

-- Smart Agent quotas (B3)
INSERT INTO public.ai_quotas (tier, tool, daily_limit) VALUES
  ('free',    'smart_agent', 20),
  ('premium', 'smart_agent', 100),
  ('admin',   'smart_agent', -1)
ON CONFLICT (tier, tool) DO NOTHING;

-- Quota check: recognize smart_agent
CREATE OR REPLACE FUNCTION public.check_ai_quota(_user_id uuid, _tool text)
 RETURNS TABLE(allowed boolean, used bigint, daily_limit integer, tier text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier text;
  v_limit integer;
  v_used bigint;
  v_provider_filter text[];
BEGIN
  v_tier := public.user_ai_tier(_user_id);
  SELECT q.daily_limit INTO v_limit FROM public.ai_quotas q
    WHERE q.tier = v_tier AND q.tool = _tool;
  IF v_limit IS NULL THEN v_limit := 0; END IF;

  v_provider_filter := CASE _tool
    WHEN 'smart_rebrand' THEN ARRAY['lovable_gateway']
    WHEN 'marketing'     THEN ARRAY['lovable_gateway']
    WHEN 'smart_agent'   THEN ARRAY['lovable_gateway','openai','openrouter','langchain']
    WHEN 'image'         THEN ARRAY['pollinations','lovable_gateway']
    WHEN 'enhance'       THEN ARRAY['lovable_gateway']
    ELSE ARRAY['lovable_gateway','pollinations']
  END;

  SELECT count(*) INTO v_used FROM public.ai_usage u
    WHERE u.partner_id = _user_id
      AND u.created_at > now() - interval '24 hours'
      AND u.provider = ANY(v_provider_filter)
      AND (
        _tool <> 'image' OR u.model IN ('flux','openai/gpt-image-2','')
      );

  RETURN QUERY SELECT
    (v_limit < 0 OR v_used < v_limit) AS allowed,
    v_used,
    v_limit,
    v_tier;
END;
$function$;