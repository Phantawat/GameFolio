-- =====================================================================
-- 🎮 GameFolio: Fix RLS Recursion on organization_members
-- =====================================================================
-- Problem:
--   "infinite recursion detected in policy for relation organization_members"
-- Cause:
--   Policies on organization_members were querying organization_members directly.
--   That re-triggers policy evaluation recursively.
--
-- Run this script in Supabase SQL Editor.
-- =====================================================================

-- 1) Helper functions that run as definer (bypass RLS recursion)
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

CREATE OR REPLACE FUNCTION public.has_any_org_membership(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.user_id = _user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_manager(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_any_org_membership(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_manager(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_org_membership(uuid) TO authenticated;

-- 2) organizations policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
CREATE POLICY "Organizations are viewable by everyone"
ON public.organizations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owners and managers can update organizations" ON public.organizations;
CREATE POLICY "Owners and managers can update organizations"
ON public.organizations
FOR UPDATE
USING (public.is_org_manager(id, auth.uid()))
WITH CHECK (public.is_org_manager(id, auth.uid()));

-- 3) organization_members policies (no self-referencing subqueries)
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view memberships in their organizations" ON public.organization_members;
CREATE POLICY "Members can view memberships in their organizations"
ON public.organization_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_org_manager(organization_id, auth.uid())
);

-- Bootstrap policy: creator can insert first OWNER row for themselves.
DROP POLICY IF EXISTS "Users can bootstrap owner membership" ON public.organization_members;
CREATE POLICY "Users can bootstrap owner membership"
ON public.organization_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role = 'OWNER'
);

DROP POLICY IF EXISTS "Owners and managers can manage members" ON public.organization_members;
CREATE POLICY "Owners and managers can manage members"
ON public.organization_members
FOR INSERT
WITH CHECK (public.is_org_manager(organization_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and managers can remove members" ON public.organization_members;
CREATE POLICY "Owners and managers can remove members"
ON public.organization_members
FOR DELETE
USING (public.is_org_manager(organization_id, auth.uid()));

-- 4) user_roles policies that depend on org membership
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own org roles" ON public.user_roles;
CREATE POLICY "Users can insert own org roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('ORG_MEMBER', 'ORG_ADMIN')
  AND public.has_any_org_membership(auth.uid())
);

DROP POLICY IF EXISTS "Users can update own org roles" ON public.user_roles;
CREATE POLICY "Users can update own org roles"
ON public.user_roles
FOR UPDATE
USING (
  user_id = auth.uid()
  AND role IN ('ORG_MEMBER', 'ORG_ADMIN')
)
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('ORG_MEMBER', 'ORG_ADMIN')
);
