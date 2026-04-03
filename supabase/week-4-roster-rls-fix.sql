-- =====================================================================
-- 🎮 GameFolio: Roster RLS Fix
-- =====================================================================
-- Symptom:
--   Recruiter can create org, but roster creation fails with permission error.
-- Cause:
--   Missing or incomplete RLS policies on public.rosters / public.roster_members.
--
-- Run this in Supabase SQL Editor.
-- =====================================================================

-- Ensure core helper exists (used by org policies too)
CREATE OR REPLACE FUNCTION public.is_org_manager(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = _org_id
      AND om.user_id = _user_id
      AND om.role IN ('OWNER', 'MANAGER')
  );
$$;

-- Helper for roster-level authorization
CREATE OR REPLACE FUNCTION public.is_roster_manager(_roster_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rosters r
    WHERE r.id = _roster_id
      AND public.is_org_manager(r.organization_id, _user_id)
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_manager(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_roster_manager(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_manager(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_roster_manager(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- ROSTERS
-- ---------------------------------------------------------------------
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view rosters" ON public.rosters;
CREATE POLICY "Managers can view rosters"
ON public.rosters
FOR SELECT
USING (public.is_org_manager(organization_id, auth.uid()));

DROP POLICY IF EXISTS "Managers can create rosters" ON public.rosters;
CREATE POLICY "Managers can create rosters"
ON public.rosters
FOR INSERT
WITH CHECK (public.is_org_manager(organization_id, auth.uid()));

DROP POLICY IF EXISTS "Managers can update rosters" ON public.rosters;
CREATE POLICY "Managers can update rosters"
ON public.rosters
FOR UPDATE
USING (public.is_org_manager(organization_id, auth.uid()))
WITH CHECK (public.is_org_manager(organization_id, auth.uid()));

DROP POLICY IF EXISTS "Managers can delete rosters" ON public.rosters;
CREATE POLICY "Managers can delete rosters"
ON public.rosters
FOR DELETE
USING (public.is_org_manager(organization_id, auth.uid()));

-- ---------------------------------------------------------------------
-- ROSTER MEMBERS
-- ---------------------------------------------------------------------
ALTER TABLE public.roster_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view roster members" ON public.roster_members;
CREATE POLICY "Managers can view roster members"
ON public.roster_members
FOR SELECT
USING (public.is_roster_manager(roster_id, auth.uid()));

DROP POLICY IF EXISTS "Managers can add roster members" ON public.roster_members;
CREATE POLICY "Managers can add roster members"
ON public.roster_members
FOR INSERT
WITH CHECK (public.is_roster_manager(roster_id, auth.uid()));

DROP POLICY IF EXISTS "Managers can update roster members" ON public.roster_members;
CREATE POLICY "Managers can update roster members"
ON public.roster_members
FOR UPDATE
USING (public.is_roster_manager(roster_id, auth.uid()))
WITH CHECK (public.is_roster_manager(roster_id, auth.uid()));

DROP POLICY IF EXISTS "Managers can remove roster members" ON public.roster_members;
CREATE POLICY "Managers can remove roster members"
ON public.roster_members
FOR DELETE
USING (public.is_roster_manager(roster_id, auth.uid()));
