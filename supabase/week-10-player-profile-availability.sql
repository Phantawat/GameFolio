-- Add player availability state for profile header actions menu.
-- This powers the "Looking for Team" toggle in the player dashboard profile.

ALTER TABLE public.player_profiles
ADD COLUMN IF NOT EXISTS seeking_team BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.player_profiles
SET seeking_team = TRUE
WHERE seeking_team IS NULL;
