CREATE OR REPLACE FUNCTION public.check_application_rate_limit()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 10
  FROM public.applications a
  JOIN public.player_profiles pp
    ON pp.id = a.player_profile_id
  WHERE pp.user_id = auth.uid()
    AND a.created_at >= NOW() - INTERVAL '60 minutes';
$$;

REVOKE ALL ON FUNCTION public.check_application_rate_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_application_rate_limit() TO authenticated;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can apply" ON public.applications;
DROP POLICY IF EXISTS "Players can apply to tryouts" ON public.applications;

CREATE POLICY "Players can apply"
ON public.applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.player_profiles
    WHERE id = applications.player_profile_id
      AND user_id = auth.uid()
  )
  AND public.check_application_rate_limit()
);
