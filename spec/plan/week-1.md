# Week 1 – Foundation & Schema

**Goal:** Backend fully structured, automated, and seeded.

## Tasks
- [x] Initialize Next.js 15+ App Router project with Tailwind CSS & shadcn/ui.
- [x] Initialize Supabase project.
- [x] Execute the complete SQL schema (`03-database-schema.md`).
- [x] Verify the `auth.users` to `public.users` PostgreSQL trigger is working. (See `supabase/setup.sql`)
- [x] **CRITICAL DATA SEED:** Write and run a `seed.sql` script to populate the `game_genres`, `games`, and `game_roles` tables (e.g., add Valorant, LoL, CS2 and their respective roles). *Your UI will not work without this base data.* (See `supabase/seed.sql`)
- [x] Setup Supabase Storage buckets for `avatars` and `organization_logos`. (See `supabase/setup.sql`)

**Deliverable:** Database finalized, Triggers working, Schema locked, Base catalog data seeded. No UI yet.
