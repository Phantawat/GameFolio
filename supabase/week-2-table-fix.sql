-- ==============================================================================
-- 🎮 GameFolio: Week 2 Fix - Missing Tables
-- ==============================================================================
-- It seems the base tables were not created. Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- CORE USER TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Check if type exists before creating
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('PLAYER', 'ORG_MEMBER', 'ORG_ADMIN', 'PLATFORM_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- ==============================
-- PLAYER DOMAIN
-- ==============================
CREATE TABLE IF NOT EXISTS public.player_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gamertag TEXT NOT NULL UNIQUE,
    bio TEXT,
    region TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- GAME CATALOG
-- ==============================
CREATE TABLE IF NOT EXISTS public.game_genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    genre_id UUID REFERENCES public.game_genres(id) ON DELETE SET NULL,
    developer TEXT,
    release_year INT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.game_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    UNIQUE(game_id, role_name)
);

-- ==============================
-- PLAYER GAME STATS
-- ==============================
CREATE TABLE IF NOT EXISTS public.player_game_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_profile_id UUID NOT NULL REFERENCES public.player_profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    main_role_id UUID REFERENCES public.game_roles(id) ON DELETE SET NULL,
    sub_role_id UUID REFERENCES public.game_roles(id) ON DELETE SET NULL,
    rank TEXT,
    mmr INT,
    win_rate NUMERIC(5,2),
    hours_played INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(player_profile_id, game_id)
);

-- ==============================
-- RLS POLICIES (Consolidated from setup.sql and fixes)
-- ==============================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own user data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- 2. Users can view their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- 3. Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.player_profiles;
CREATE POLICY "Users can insert own profile" ON public.player_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Public access to profiles (for viewing)
CREATE POLICY "Public profiles are viewable by everyone" ON public.player_profiles FOR SELECT USING (true);
