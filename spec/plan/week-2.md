# Week 2 – Authentication & Onboarding

**Goal:** Secure, cookie-based role management & profile creation.

## Tasks
- [x] Implement Supabase Auth (Signup/Login UI).
- [x] Setup Next.js App Router auth using `@supabase/ssr` (Cookie management).
- [x] Build the Next.js Middleware to protect `/(dashboard)` routes.
- [x] **The Onboarding Flow:** Build the UI that forces new users to enter their `gamertag` and insert their record into `player_profiles` immediately after signup.
- [x] Verify RLS policies are actively blocking unauthorized access. (Added `Users can insert own profile` policy in `supabase/week-2-fixes.sql`)

**Deliverable:** Users can securely log in, create their base gamer profile, and are routed to the correct dashboard based on their role.
