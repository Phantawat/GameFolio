-- ==============================================================================
-- 🎮 GameFolio: Seed Data
-- ==============================================================================
-- This script MUST be run in the Supabase SQL Editor.
-- It populates the game catalog with Genres, Games, and Roles.
-- ==============================================================================

BEGIN;

-- 1. Insert Genres
INSERT INTO public.game_genres (name) VALUES
    ('Tactical Shooter'),
    ('MOBA'),
    ('Battle Royale'),
    ('Fighting'),
    ('Card Game'),
    ('Strategy')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Games (and capture IDs for roles)
-- We use a CTE (Common Table Expression) to insert games and retrieve their IDs.

WITH new_games AS (
    INSERT INTO public.games (name, genre_id, developer, release_year)
    VALUES 
        -- Valorant (Tactical Shooter)
        ('Valorant', (SELECT id FROM public.game_genres WHERE name = 'Tactical Shooter'), 'Riot Games', 2020),
        -- League of Legends (MOBA)
        ('League of Legends', (SELECT id FROM public.game_genres WHERE name = 'MOBA'), 'Riot Games', 2009),
        -- Counter-Strike 2 (Tactical Shooter)
        ('Counter-Strike 2', (SELECT id FROM public.game_genres WHERE name = 'Tactical Shooter'), 'Valve', 2023),
        -- Dota 2 (MOBA)
        ('Dota 2', (SELECT id FROM public.game_genres WHERE name = 'MOBA'), 'Valve', 2013),
        -- Apex Legends (Battle Royale)
        ('Apex Legends', (SELECT id FROM public.game_genres WHERE name = 'Battle Royale'), 'Respawn Entertainment', 2019),
         -- Overwatch 2 (Tactical Shooter - loose fit, but close enough for catalog)
        ('Overwatch 2', (SELECT id FROM public.game_genres WHERE name = 'Tactical Shooter'), 'Blizzard Entertainment', 2022)
    ON CONFLICT (name) DO UPDATE SET is_active = EXCLUDED.is_active -- Dummy update to return ID
    RETURNING id, name
)
SELECT * FROM new_games;

-- 3. Insert Game Roles
-- Since we can't easily use variables in pure SQL without PL/pgSQL blocks for IDs, 
-- we will use subqueries to find the game IDs dynamically.

-- -- Valorant Roles
INSERT INTO public.game_roles (game_id, role_name) VALUES
    ((SELECT id FROM public.games WHERE name = 'Valorant'), 'Duelist'),
    ((SELECT id FROM public.games WHERE name = 'Valorant'), 'Initiator'),
    ((SELECT id FROM public.games WHERE name = 'Valorant'), 'Controller'),
    ((SELECT id FROM public.games WHERE name = 'Valorant'), 'Sentinel'),
     ((SELECT id FROM public.games WHERE name = 'Valorant'), 'Coach'),
    ((SELECT id FROM public.games WHERE name = 'Valorant'), 'Analyst')
ON CONFLICT (game_id, role_name) DO NOTHING;

-- -- League of Legends Roles
INSERT INTO public.game_roles (game_id, role_name) VALUES
    ((SELECT id FROM public.games WHERE name = 'League of Legends'), 'Top Laner'),
    ((SELECT id FROM public.games WHERE name = 'League of Legends'), 'Jungler'),
    ((SELECT id FROM public.games WHERE name = 'League of Legends'), 'Mid Laner'),
    ((SELECT id FROM public.games WHERE name = 'League of Legends'), 'Bot Laner (ADC)'),
    ((SELECT id FROM public.games WHERE name = 'League of Legends'), 'Support'),
     ((SELECT id FROM public.games WHERE name = 'League of Legends'), 'Coach')
ON CONFLICT (game_id, role_name) DO NOTHING;

-- -- Counter-Strike 2 Roles
INSERT INTO public.game_roles (game_id, role_name) VALUES
    ((SELECT id FROM public.games WHERE name = 'Counter-Strike 2'), 'Entry Fragger'),
    ((SELECT id FROM public.games WHERE name = 'Counter-Strike 2'), 'AWPer'),
    ((SELECT id FROM public.games WHERE name = 'Counter-Strike 2'), 'Rifler'),
    ((SELECT id FROM public.games WHERE name = 'Counter-Strike 2'), 'Support'),
    ((SELECT id FROM public.games WHERE name = 'Counter-Strike 2'), 'In-Game Leader (IGL)'),
    ((SELECT id FROM public.games WHERE name = 'Counter-Strike 2'), 'Lurker')
ON CONFLICT (game_id, role_name) DO NOTHING;

-- -- Dota 2 Roles
INSERT INTO public.game_roles (game_id, role_name) VALUES
    ((SELECT id FROM public.games WHERE name = 'Dota 2'), 'Carry (Pos 1)'),
    ((SELECT id FROM public.games WHERE name = 'Dota 2'), 'Mid (Pos 2)'),
    ((SELECT id FROM public.games WHERE name = 'Dota 2'), 'Offlane (Pos 3)'),
    ((SELECT id FROM public.games WHERE name = 'Dota 2'), 'Soft Support (Pos 4)'),
    ((SELECT id FROM public.games WHERE name = 'Dota 2'), 'Hard Support (Pos 5)')
ON CONFLICT (game_id, role_name) DO NOTHING;

-- -- Apex Legends Roles
INSERT INTO public.game_roles (game_id, role_name) VALUES
    ((SELECT id FROM public.games WHERE name = 'Apex Legends'), 'Entry Fragger'),
    ((SELECT id FROM public.games WHERE name = 'Apex Legends'), 'Anchor'),
    ((SELECT id FROM public.games WHERE name = 'Apex Legends'), 'Support'),
    ((SELECT id FROM public.games WHERE name = 'Apex Legends'), 'IGL')
ON CONFLICT (game_id, role_name) DO NOTHING;

-- -- Overwatch 2 Roles
INSERT INTO public.game_roles (game_id, role_name) VALUES
    ((SELECT id FROM public.games WHERE name = 'Overwatch 2'), 'Tank'),
    ((SELECT id FROM public.games WHERE name = 'Overwatch 2'), 'Damage (DPS)'),
    ((SELECT id FROM public.games WHERE name = 'Overwatch 2'), 'Support')
ON CONFLICT (game_id, role_name) DO NOTHING;

COMMIT;

-- Check Execution
SELECT 
    g.name as Game, 
    COUNT(gr.id) as Roles_Defined
FROM public.games g
LEFT JOIN public.game_roles gr ON g.id = gr.game_id
GROUP BY g.name;
