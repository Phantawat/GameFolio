-- ==============================================================================
-- 🎮 GameFolio: Setup & Verification Script
-- ==============================================================================
-- Run this in the Supabase SQL Editor to complete Week 1 Setup.
-- ==============================================================================

-- 1. VERIFY & ENSURE TRIGGER EXISTS
-- We'll recreate the function and trigger to ensure it's correct.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert base user record
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  
  -- Assign default PLAYER role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'PLAYER'::user_role_type);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to avoid duplication error on creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verification Query (Run this separately if you want to check)
-- SELECT event_object_table, trigger_name 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'users' AND trigger_schema = 'auth';


-- 2. SETUP STORAGE BUCKETS & POLICIES
-- NOTE: If you get "relation storage.buckets does not exist", enable the storage extension or create buckets in the Dashboard.

-- Attempt to create 'avatars' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Attempt to create 'organization_logos' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization_logos', 'organization_logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- allow public access to view
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Public Access Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'organization_logos' );

-- allow authenticated users to upload their own avatar
CREATE POLICY "User Upload Avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- allow authenticated users (recruiters) to upload logos
CREATE POLICY "Recruiter Upload Logo"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'organization_logos' 
    AND auth.role() = 'authenticated' -- refinement needed later for checking org membership
);
