-- ==============================================================================
-- 🎮 GameFolio: Week 4 RLS Fixes (Organizations)
-- ==============================================================================
-- Run this in Supabase SQL Editor if org creation is failing.
-- This enables minimal safe policies for organizations + memberships + ORG_ADMIN upsert.
-- ==============================================================================

-- Enable RLS for recruiter-domain tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ------------------------------
-- organizations policies
-- ------------------------------
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
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('OWNER', 'MANAGER')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('OWNER', 'MANAGER')
  )
);

-- ------------------------------
-- organization_members policies
-- ------------------------------
DROP POLICY IF EXISTS "Members can view memberships in their organizations" ON public.organization_members;
CREATE POLICY "Members can view memberships in their organizations"
ON public.organization_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.organization_members mym
    WHERE mym.organization_id = organization_members.organization_id
      AND mym.user_id = auth.uid()
  )
);

-- Allow owner bootstrap row during org creation.
-- This permits inserting an OWNER row for yourself only when the org has no members yet.
DROP POLICY IF EXISTS "Users can bootstrap owner membership" ON public.organization_members;
CREATE POLICY "Users can bootstrap owner membership"
ON public.organization_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role = 'OWNER'
  AND NOT EXISTS (
    SELECT 1
    FROM public.organization_members existing
    WHERE existing.organization_id = organization_members.organization_id
  )
);

DROP POLICY IF EXISTS "Owners and managers can manage members" ON public.organization_members;
CREATE POLICY "Owners and managers can manage members"
ON public.organization_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_members mym
    WHERE mym.organization_id = organization_members.organization_id
      AND mym.user_id = auth.uid()
      AND mym.role IN ('OWNER', 'MANAGER')
  )
);

DROP POLICY IF EXISTS "Owners and managers can remove members" ON public.organization_members;
CREATE POLICY "Owners and managers can remove members"
ON public.organization_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members mym
    WHERE mym.organization_id = organization_members.organization_id
      AND mym.user_id = auth.uid()
      AND mym.role IN ('OWNER', 'MANAGER')
  )
);

-- ------------------------------
-- user_roles policies (for ORG_ADMIN upsert)
-- ------------------------------
DROP POLICY IF EXISTS "Users can insert own org roles" ON public.user_roles;
CREATE POLICY "Users can insert own org roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('ORG_MEMBER', 'ORG_ADMIN')
  AND EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.user_id = auth.uid()
  )
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
