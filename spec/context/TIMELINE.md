# 🗓️ GameFolio: Execution Roadmap & Timeline

## 📌 Critical Dates
* **Start Date:** Late February
* **Feature Freeze:** April 8
* **Buffer / QA Week:** April 9 – April 15
* **Submission Deadline:** April 16

---

## 🧱 WEEK 1 – Foundation & Schema
*🎯 Goal: Backend fully structured, automated, and seeded.*

**Tasks:**
* Initialize Next.js 15+ App Router project with Tailwind CSS & shadcn/ui.
* Initialize Supabase project.
* Execute the complete SQL schema (`03-database-schema.md`).
* Verify the `auth.users` to `public.users` PostgreSQL trigger is working.
* **🔥 CRITICAL DATA SEED:** Write and run a `seed.sql` script to populate the `game_genres`, `games`, and `game_roles` tables (e.g., add Valorant, LoL, CS2 and their respective roles). *Your UI will not work without this base data.*
* Setup Supabase Storage buckets for `avatars` and `organization_logos`.

**Deliverable:** Database finalized, Triggers working, Schema locked, Base catalog data seeded. No UI yet.

---

## 🔐 WEEK 2 – Authentication & Onboarding
*🎯 Goal: Secure, cookie-based role management & profile creation.*

**Tasks:**
* Implement Supabase Auth (Signup/Login UI).
* Setup Next.js App Router auth using `@supabase/ssr` (Cookie management).
* Build the Next.js Middleware to protect `/(dashboard)` routes.
* **The Onboarding Flow:** Build the UI that forces new users to enter their `gamertag` and insert their record into `player_profiles` immediately after signup.
* Verify RLS policies are actively blocking unauthorized access.

**Deliverable:** Users can securely log in, create their base gamer profile, and are routed to the correct dashboard based on their role.

---

## 🎮 WEEK 3 – Player Features (Mobile-First)
*🎯 Goal: Complete the Player Experience.*

**Tasks:**
* Build the Player Profile dashboard (View/Edit `gamertag`, `bio`, `region`).
* Build the UI to add/edit `player_game_stats` (selecting from the seeded Games list).
* Build the public "Tryout Search" page (List all active tryouts).
* Implement the "Apply to Tryout" action (inserting a row into `applications`).
* Build the "My Applications" tracking view for players.

**Deliverable:** Fully working Player workflow. Test by creating a player account and browsing mock tryouts.

---

## 🏢 WEEK 4 – Recruiter & Roster Features
*🎯 Goal: Organization management and the Recruitment loop.*

**Tasks:**
* Build the Organization creation flow (name, logo upload).
* Build the Roster management UI (add a Roster for a specific Game).
* Build the "Post New Tryout" UI (linking to games/roles and optionally rosters).
* Build the "Manage Applications" dashboard for recruiters (View applicants, update status to `REVIEWING`, `ACCEPTED`, `REJECTED`).

**Deliverable:** Complete recruitment flow. The platform now works end-to-end between Players and Recruiters.

---

## 👑 WEEK 5 – Admin Controls & Polish
*🎯 Goal: System management and core UI cleanup.*

**Tasks:**
* Build the Platform Admin dashboard (requires `PLATFORM_ADMIN` role).
* Implement simple data tables to view all Organizations and Tryouts.
* Add moderation capabilities (e.g., toggling `is_active` to false on a malicious tryout).
* Standardize all loading states (`loading.tsx` skeletons).
* Implement global error handling and toast notifications for user actions.

**Deliverable:** Full 3-role architecture complete and stable.

---

## 🧪 WEEK 6 – Optimization & Pre-Launch
*🎯 Goal: Portfolio-level professionalization.*

**Tasks:**
* Final UI polish and responsive layout verification (Desktop vs. Mobile).
* Security review: Audit all Supabase RLS policies one last time.
* Clean up codebase (Remove `console.log`s, format files, fix hydration errors).
* Write a comprehensive `README.md` with setup instructions and your architecture diagram.
* Prepare your final demo script/recording.

**Deliverable:** **🛑 FEATURE FREEZE ON APRIL 8.**

---

## 🛑 WEEK 7 – Buffer Week (April 9–15)
*🎯 Goal: Disaster prevention and final presentation prep. NO NEW FEATURES.*

**Tasks:**
* Fix any critical bugs discovered during final walkthroughs.
* Rehearse the live demo or record the submission video.
* Ensure the Vercel production deployment is stable and environment variables are set correctly.
* Rest and prepare for submission.

---

## 🧠 Core Development Rules
1. **Vertical Slicing:** Build one feature end-to-end (Database -> Server Action -> UI) before moving to the next.
2. **Mobile First:** Use Tailwind's `md:` and `lg:` prefixes while building. Do not save responsive design for Week 6.
3. **Stick to the Spec:** If a feature isn't in this spec-kit, it does not get built until after April 16th.