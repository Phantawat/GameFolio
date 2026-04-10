-- Deterministic E2E fixtures for Playwright role-based flows.
-- Run after base schema and game catalog seeds.

BEGIN;

-- 1) Seed auth users with deterministic UUIDs and known credentials.
-- Passwords here should match your local/CI E2E_* env variables.
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'e2e-admin@gamefolio.test',
    crypt('E2EAdminPass!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'e2e-player@gamefolio.test',
    crypt('E2EPlayerPass!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'e2e-recruiter@gamefolio.test',
    crypt('E2ERecruiterPass!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'e2e-recruiter-no-org@gamefolio.test',
    crypt('E2ENoOrgPass!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'e2e-onboarding@gamefolio.test',
    crypt('E2EOnboardPass!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- 2) Ensure base public users and roles are present.
INSERT INTO public.users (id, email, is_suspended)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'e2e-admin@gamefolio.test', false),
  ('10000000-0000-4000-8000-000000000002', 'e2e-player@gamefolio.test', false),
  ('10000000-0000-4000-8000-000000000003', 'e2e-recruiter@gamefolio.test', false),
  ('10000000-0000-4000-8000-000000000004', 'e2e-recruiter-no-org@gamefolio.test', false),
  ('10000000-0000-4000-8000-000000000005', 'e2e-onboarding@gamefolio.test', false)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email, is_suspended = false;

INSERT INTO public.user_roles (user_id, role)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'PLATFORM_ADMIN'),
  ('10000000-0000-4000-8000-000000000001', 'PLAYER'),
  ('10000000-0000-4000-8000-000000000002', 'PLAYER'),
  ('10000000-0000-4000-8000-000000000003', 'PLAYER'),
  ('10000000-0000-4000-8000-000000000003', 'ORG_ADMIN'),
  ('10000000-0000-4000-8000-000000000004', 'ORG_ADMIN'),
  ('10000000-0000-4000-8000-000000000005', 'PLAYER')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3) Seed deterministic organization graph.
INSERT INTO public.organizations (id, name, description, region)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'E2E Phoenix Org',
  'Deterministic organization for E2E recruiter and admin journeys.',
  'NA'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, region = EXCLUDED.region;

INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'OWNER')
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- 4) Player profiles: seeded player has profile; onboarding account intentionally does not.
INSERT INTO public.player_profiles (id, user_id, gamertag, region, bio, seeking_team)
VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    'E2EPlayerOne',
    'NA',
    'Seeded player profile for Playwright E2E.',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    'E2ERecruiterPlayer',
    'NA',
    'Recruiter dual-mode profile for mode switching checks.',
    true
  )
ON CONFLICT (user_id) DO UPDATE
SET
  gamertag = EXCLUDED.gamertag,
  region = EXCLUDED.region,
  bio = EXCLUDED.bio,
  seeking_team = EXCLUDED.seeking_team,
  updated_at = now();

DELETE FROM public.player_profiles WHERE user_id = '10000000-0000-4000-8000-000000000005';

-- 5) Roster + tryouts + applications fixtures.
WITH primary_game AS (
  SELECT id FROM public.games ORDER BY name LIMIT 1
),
primary_role AS (
  SELECT gr.id
  FROM public.game_roles gr
  JOIN primary_game pg ON pg.id = gr.game_id
  ORDER BY gr.role_name
  LIMIT 1
)
INSERT INTO public.rosters (id, organization_id, game_id, name, description)
SELECT
  '40000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  pg.id,
  'E2E Main Roster',
  'Primary seeded roster for recruiter tests.'
FROM primary_game pg
ON CONFLICT (id) DO UPDATE
SET
  organization_id = EXCLUDED.organization_id,
  game_id = EXCLUDED.game_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

WITH primary_game AS (
  SELECT id FROM public.games ORDER BY name LIMIT 1
),
primary_role AS (
  SELECT gr.id
  FROM public.game_roles gr
  JOIN primary_game pg ON pg.id = gr.game_id
  ORDER BY gr.role_name
  LIMIT 1
)
INSERT INTO public.tryouts (
  id,
  organization_id,
  game_id,
  roster_id,
  role_needed_id,
  title,
  requirements,
  job_description,
  is_active,
  deleted_at,
  deleted_by
)
SELECT *
FROM (
  SELECT
    '50000000-0000-4000-8000-000000000001'::uuid AS id,
    '20000000-0000-4000-8000-000000000001'::uuid AS organization_id,
    pg.id AS game_id,
    '40000000-0000-4000-8000-000000000001'::uuid AS roster_id,
    pr.id AS role_needed_id,
    'E2E Admin Toggle Tryout'::text AS title,
    'Minimum Rank: Immortal'::text AS requirements,
    'Admin moderation target tryout.'::text AS job_description,
    true AS is_active,
    NULL::timestamp AS deleted_at,
    NULL::uuid AS deleted_by
  FROM primary_game pg CROSS JOIN primary_role pr

  UNION ALL

  SELECT
    '50000000-0000-4000-8000-000000000002'::uuid,
    '20000000-0000-4000-8000-000000000001'::uuid,
    pg.id,
    '40000000-0000-4000-8000-000000000001'::uuid,
    pr.id,
    'E2E Player Apply Tryout'::text,
    'Minimum Rank: Diamond'::text,
    'Player apply flow target tryout.'::text,
    true,
    NULL::timestamp,
    NULL::uuid
  FROM primary_game pg CROSS JOIN primary_role pr

  UNION ALL

  SELECT
    '50000000-0000-4000-8000-000000000003'::uuid,
    '20000000-0000-4000-8000-000000000001'::uuid,
    pg.id,
    '40000000-0000-4000-8000-000000000001'::uuid,
    pr.id,
    'E2E Duplicate Apply Tryout'::text,
    'Minimum Rank: Platinum'::text,
    'Duplicate apply guard target tryout.'::text,
    true,
    NULL::timestamp,
    NULL::uuid
  FROM primary_game pg CROSS JOIN primary_role pr
) seeded
ON CONFLICT (id) DO UPDATE
SET
  organization_id = EXCLUDED.organization_id,
  game_id = EXCLUDED.game_id,
  roster_id = EXCLUDED.roster_id,
  role_needed_id = EXCLUDED.role_needed_id,
  title = EXCLUDED.title,
  requirements = EXCLUDED.requirements,
  job_description = EXCLUDED.job_description,
  is_active = EXCLUDED.is_active,
  deleted_at = NULL,
  deleted_by = NULL,
  updated_at = now();

INSERT INTO public.applications (id, tryout_id, player_profile_id, status, message)
VALUES
  (
    '60000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000001',
    'PENDING',
    'Seeded duplicate-apply fixture'
  )
ON CONFLICT (tryout_id, player_profile_id) DO UPDATE
SET status = 'PENDING', message = EXCLUDED.message, updated_at = now();

COMMIT;
