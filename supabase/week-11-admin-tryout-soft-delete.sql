-- Soft-delete support for admin tryout moderation.
-- Adds audit fields and aligns policies to hide deleted rows from public/recruiter views.

ALTER TABLE public.tryouts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.users(id);

ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active tryouts viewable by everyone" ON public.tryouts;
CREATE POLICY "Active tryouts viewable by everyone"
ON public.tryouts
FOR SELECT
USING (
  is_active = true
  AND deleted_at IS NULL
  AND (closes_at IS NULL OR closes_at > NOW())
);

DROP POLICY IF EXISTS "Org managers can update tryouts" ON public.tryouts;
CREATE POLICY "Org managers can update tryouts"
ON public.tryouts
FOR UPDATE
USING (
  public.is_org_manager(organization_id, auth.uid())
  AND deleted_at IS NULL
)
WITH CHECK (
  public.is_org_manager(organization_id, auth.uid())
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.tryouts t_old
    WHERE t_old.id = tryouts.id
      AND t_old.organization_id = tryouts.organization_id
  )
);

DROP POLICY IF EXISTS "Platform admins can update tryouts" ON public.tryouts;
CREATE POLICY "Platform admins can update tryouts"
ON public.tryouts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'PLATFORM_ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'PLATFORM_ADMIN'
  )
);
