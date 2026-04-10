-- Allow platform admins to toggle tryout active status from the admin dashboard.
-- Symptom fixed: admin action updates return RLS permission errors and do not persist.

ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

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
