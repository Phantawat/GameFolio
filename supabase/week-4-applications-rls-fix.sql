ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications" ON public.applications;
DROP POLICY IF EXISTS "Users can view applications" ON public.applications;

CREATE POLICY "Players can view own applications or org members can view org tryout applications"
ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.player_profiles pp
    WHERE pp.id = applications.player_profile_id
      AND pp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.tryouts t
    JOIN public.organization_members om
      ON om.organization_id = t.organization_id
    WHERE t.id = applications.tryout_id
      AND om.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Recruiters can update application status" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update applications" ON public.applications;

CREATE POLICY "Org members can update applications for their org tryouts"
ON public.applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.tryouts t
    JOIN public.organization_members om
      ON om.organization_id = t.organization_id
    WHERE t.id = applications.tryout_id
      AND om.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tryouts t
    JOIN public.organization_members om
      ON om.organization_id = t.organization_id
    WHERE t.id = applications.tryout_id
      AND om.user_id = auth.uid()
  )
);
