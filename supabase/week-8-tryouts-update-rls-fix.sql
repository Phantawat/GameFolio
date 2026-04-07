-- Fix recruiter tryout edit failures caused by restrictive tryouts SELECT/UPDATE RLS.
-- Symptom: UI toast "Failed to update tryout. Please try again." when editing some tryouts.

ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

-- Allow owners/managers to read all tryouts for their organizations (including drafts/inactive).
DROP POLICY IF EXISTS "Org managers can view own org tryouts" ON public.tryouts;
CREATE POLICY "Org managers can view own org tryouts"
ON public.tryouts
FOR SELECT
USING (public.is_org_manager(organization_id, auth.uid()));

-- Recreate UPDATE policy without the self-select EXISTS clause that can fail under RLS.
DROP POLICY IF EXISTS "Org managers can update tryouts" ON public.tryouts;
CREATE POLICY "Org managers can update tryouts"
ON public.tryouts
FOR UPDATE
USING (public.is_org_manager(organization_id, auth.uid()))
WITH CHECK (public.is_org_manager(organization_id, auth.uid()));
