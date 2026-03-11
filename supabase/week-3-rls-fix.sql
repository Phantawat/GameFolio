-- ==============================================================================
-- Week 3 RLS Fix: Game Catalog Public Read Policies
-- ==============================================================================
-- The games, game_genres, and game_roles tables are reference/catalog data that
-- everyone (authenticated or anon) should be able to read freely.
-- Without these policies, Supabase silently returns 0 rows even though data exists.
-- ==============================================================================
-- Run this in: Supabase Dashboard → SQL Editor
-- ==============================================================================

-- Game genres (public read)
ALTER TABLE public.game_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game genres are viewable by everyone"
  ON public.game_genres FOR SELECT USING (true);

-- Games (public read)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are viewable by everyone"
  ON public.games FOR SELECT USING (true);

-- Game roles (public read)
ALTER TABLE public.game_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game roles are viewable by everyone"
  ON public.game_roles FOR SELECT USING (true);

-- Player game stats: players can read/write their own stats
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players can view their own game stats"
  ON public.player_game_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.player_profiles
      WHERE id = player_game_stats.player_profile_id
        AND user_id = auth.uid()
    )
  );
CREATE POLICY "Players can insert their own game stats"
  ON public.player_game_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.player_profiles
      WHERE id = player_game_stats.player_profile_id
        AND user_id = auth.uid()
    )
  );
CREATE POLICY "Players can update their own game stats"
  ON public.player_game_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.player_profiles
      WHERE id = player_game_stats.player_profile_id
        AND user_id = auth.uid()
    )
  );
