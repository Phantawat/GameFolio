ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tryouts
ADD COLUMN IF NOT EXISTS closes_at TIMESTAMP;

DROP POLICY IF EXISTS "Tryouts are viewable by everyone" ON public.tryouts;
DROP POLICY IF EXISTS "Active tryouts viewable by everyone" ON public.tryouts;
DROP POLICY IF EXISTS "Org managers can insert tryouts" ON public.tryouts;
DROP POLICY IF EXISTS "Org managers can update tryouts" ON public.tryouts;
DROP POLICY IF EXISTS "Org managers can delete tryouts" ON public.tryouts;
DROP POLICY IF EXISTS "Platform admins can view all tryouts" ON public.tryouts;

CREATE POLICY "Active tryouts viewable by everyone"
ON public.tryouts
FOR SELECT
USING (
  is_active = true
  AND (closes_at IS NULL OR closes_at > NOW())
);

CREATE POLICY "Platform admins can view all tryouts"
ON public.tryouts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'PLATFORM_ADMIN'
  )
);

CREATE POLICY "Org managers can insert tryouts"
ON public.tryouts
FOR INSERT
WITH CHECK (public.is_org_manager(organization_id, auth.uid()));

CREATE POLICY "Org managers can update tryouts"
ON public.tryouts
FOR UPDATE
USING (public.is_org_manager(organization_id, auth.uid()))
WITH CHECK (
  public.is_org_manager(organization_id, auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.tryouts t_old
    WHERE t_old.id = tryouts.id
      AND t_old.organization_id = tryouts.organization_id
  )
);

CREATE POLICY "Org managers can delete tryouts"
ON public.tryouts
FOR DELETE
USING (public.is_org_manager(organization_id, auth.uid()));
