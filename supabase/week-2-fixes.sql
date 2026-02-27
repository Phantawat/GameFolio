-- ==============================================================================
-- 🎮 GameFolio: Week 2 RLS Fixes
-- ==============================================================================
-- Run this in Supabase SQL Editor to enable Onboarding.
-- ==============================================================================

-- 1. Allow authenticated users to create their own Player Profile
-- This is required for the /onboarding flow.

CREATE POLICY "Users can insert own profile" 
ON public.player_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Verify other base policies (idempotent checks)
-- Ensure users can read their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());
