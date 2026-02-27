-- ==============================================================================
-- 🎮 GameFolio: Debug & Fix Trigger Function
-- ==============================================================================
-- Run this in Supabase SQL Editor.
-- This script explicitly sets the Search Path and grants permissions to fix the 500.
-- ==============================================================================

-- 1. Redefine the function with explicit search_path and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert base user record
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  
  -- Assign default PLAYER role. We use explicit casting to public.user_role_type
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'PLAYER'::public.user_role_type);
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error so we can see it in Supabase logs if it fails again
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Re-raise so the transaction aborts and the user sees the error (or auth fails)
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Ensure permissions are granted to the postgres/service_role
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO postgres, service_role;
GRANT ALL ON TABLE public.user_roles TO postgres, service_role;
GRANT ALL ON TABLE public.player_profiles TO postgres, service_role;

-- 3. Verify Trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
