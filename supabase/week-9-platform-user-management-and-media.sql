-- ==============================================================================
-- 🎮 GameFolio: Week 9 - Platform User Management + Media Schema Foundation
-- ==============================================================================
-- Adds:
--   1) public.tryouts.job_description
--   2) public.player_profiles.avatar_url
--   3) public.users.is_suspended
--
-- Also introduces policy helper for platform admin checks and minimum RLS policies
-- needed for upcoming admin user-management and avatar/logo update flows.
--
-- Rollback notes:
--   - To rollback columns:
--       ALTER TABLE public.tryouts DROP COLUMN IF EXISTS job_description;
--       ALTER TABLE public.player_profiles DROP COLUMN IF EXISTS avatar_url;
--       ALTER TABLE public.users DROP COLUMN IF EXISTS is_suspended;
--   - To rollback helper:
--       DROP FUNCTION IF EXISTS public.is_platform_admin(uuid);
--   - To rollback policies: DROP POLICY ... on affected tables.
-- ==============================================================================

-- ------------------------------
-- Schema additions (additive only)
-- ------------------------------
ALTER TABLE public.tryouts
ADD COLUMN IF NOT EXISTS job_description TEXT;

ALTER TABLE public.player_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

-- ------------------------------
-- Helper for admin policy checks
-- ------------------------------
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'PLATFORM_ADMIN'
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;

-- ------------------------------
-- player_profiles update policy
-- ------------------------------
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own profile" ON public.player_profiles;
CREATE POLICY "Users can update own profile"
ON public.player_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------
-- users policies for admin flows
-- ------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can view all users" ON public.users;
CREATE POLICY "Platform admins can view all users"
ON public.users
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Platform admins can update user suspension" ON public.users;
CREATE POLICY "Platform admins can update user suspension"
ON public.users
FOR UPDATE
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- ------------------------------
-- user_roles read policy for admin user table
-- ------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform admins can view all roles" ON public.user_roles;
CREATE POLICY "Platform admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_platform_admin(auth.uid()));
