-- 1. ai_usage grants (fixes silent failures)
GRANT SELECT, INSERT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;

-- 2. Tighten partner insert policy: partners can only log free-provider rows
DROP POLICY IF EXISTS ai_usage_partner_insert ON public.ai_usage;
CREATE POLICY ai_usage_partner_insert ON public.ai_usage
  FOR INSERT TO authenticated
  WITH CHECK (
    partner_id = auth.uid()
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR provider = 'pollinations'
    )
  );

-- 3. profiles.tier
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free'
  CHECK (tier IN ('free','premium','admin'));

-- 4. ai_quotas table
CREATE TABLE IF NOT EXISTS public.ai_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL CHECK (tier IN ('free','premium','admin')),
  tool text NOT NULL CHECK (tool IN ('smart_rebrand','marketing','image','enhance')),
  daily_limit integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tier, tool)
);
GRANT SELECT ON public.ai_quotas TO authenticated;
GRANT ALL ON public.ai_quotas TO service_role;
ALTER TABLE public.ai_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_quotas_read_all ON public.ai_quotas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY ai_quotas_admin_write ON public.ai_quotas
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Seed defaults (-1 = unlimited)
INSERT INTO public.ai_quotas (tier, tool, daily_limit) VALUES
  ('free','smart_rebrand',3),
  ('free','marketing',10),
  ('free','image',20),
  ('free','enhance',0),
  ('premium','smart_rebrand',20),
  ('premium','marketing',100),
  ('premium','image',200),
  ('premium','enhance',0),
  ('admin','smart_rebrand',-1),
  ('admin','marketing',-1),
  ('admin','image',-1),
  ('admin','enhance',-1)
ON CONFLICT (tier, tool) DO NOTHING;

-- 5. Admin alert thresholds
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS ai_alert_warn_daily integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS ai_alert_crit_daily integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS ai_credit_budget_monthly integer NOT NULL DEFAULT 10000;

-- 6. Effective-tier helper (admin role wins over profile tier)
CREATE OR REPLACE FUNCTION public.user_ai_tier(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE
    WHEN public.has_role(_user_id, 'admin'::app_role) THEN 'admin'
    ELSE COALESCE((SELECT tier FROM public.profiles WHERE id = _user_id), 'free')
  END;
$$;

-- 7. Quota check: returns row {allowed, used, daily_limit, tier}
CREATE OR REPLACE FUNCTION public.check_ai_quota(_user_id uuid, _tool text)
RETURNS TABLE(allowed boolean, used bigint, daily_limit integer, tier text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_limit integer;
  v_used bigint;
  v_provider_filter text[];
BEGIN
  v_tier := public.user_ai_tier(_user_id);
  SELECT daily_limit INTO v_limit FROM public.ai_quotas
    WHERE tier = v_tier AND tool = _tool;
  IF v_limit IS NULL THEN v_limit := 0; END IF;

  -- Count successful + attempted rows in last 24h matching this tool
  v_provider_filter := CASE _tool
    WHEN 'smart_rebrand' THEN ARRAY['lovable_gateway']
    WHEN 'marketing'     THEN ARRAY['lovable_gateway']
    WHEN 'image'         THEN ARRAY['pollinations','lovable_gateway']
    WHEN 'enhance'       THEN ARRAY['lovable_gateway']
    ELSE ARRAY['lovable_gateway','pollinations']
  END;

  SELECT count(*) INTO v_used FROM public.ai_usage
    WHERE partner_id = _user_id
      AND created_at > now() - interval '24 hours'
      AND provider = ANY(v_provider_filter)
      AND (
        _tool <> 'image' OR model IN ('flux','openai/gpt-image-2','')
      );

  RETURN QUERY SELECT
    (v_limit < 0 OR v_used < v_limit) AS allowed,
    v_used,
    v_limit,
    v_tier;
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_ai_quota(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_ai_tier(uuid) TO authenticated;