ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Player game stats are viewable by everyone" ON public.player_game_stats;
DROP POLICY IF EXISTS "Players can view their own game stats" ON public.player_game_stats;
DROP POLICY IF EXISTS "Players can insert their own game stats" ON public.player_game_stats;
DROP POLICY IF EXISTS "Players can update their own game stats" ON public.player_game_stats;
DROP POLICY IF EXISTS "Players can delete their own game stats" ON public.player_game_stats;

CREATE POLICY "Player game stats are viewable by everyone"
ON public.player_game_stats
FOR SELECT
USING (true);

CREATE POLICY "Players can insert their own game stats"
ON public.player_game_stats
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.player_profiles pp
    WHERE pp.id = player_game_stats.player_profile_id
      AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Players can update their own game stats"
ON public.player_game_stats
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.player_profiles pp
    WHERE pp.id = player_game_stats.player_profile_id
      AND pp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.player_profiles pp
    WHERE pp.id = player_game_stats.player_profile_id
      AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Players can delete their own game stats"
ON public.player_game_stats
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.player_profiles pp
    WHERE pp.id = player_game_stats.player_profile_id
      AND pp.user_id = auth.uid()
  )
);
