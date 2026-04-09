# GameFolio Execution Checklist - Admin, Player, Tryout, and Media

## Objective

Ship a focused upgrade across four areas:

- Admin: user management and platform dashboard
- Player: replace incorrect self-profile action
- Tryout: add first-class job description
- Media: support player avatar and org logo updates

## Scope Guardrails

- Keep within MVP and current architecture (Next.js App Router, Supabase, Tailwind, shadcn)
- Preserve role-based security and RLS boundaries
- Favor additive schema changes only
- No out-of-scope platform features (chat, payments, external APIs)

## Execution Order

- [ ] Phase 1: Schema and policy foundation
- [ ] Phase 2: Tryout job description end-to-end
- [ ] Phase 3: Player profile CTA fix and avatar upload
- [ ] Phase 4: Org logo update flow (post-creation)
- [ ] Phase 5: Admin user management and platform dashboard
- [ ] Phase 6: Test pass, security pass, regression signoff

## Progress Snapshot (In-Repo)

- [x] Phase 1 migration scaffold added in supabase/week-9-platform-user-management-and-media.sql
- [x] frontend/lib/database.types.ts updated with job_description, avatar_url, and is_suspended
- [x] Tryout create/edit actions persist job_description separately
- [x] Tryout browse and application detail surfaces render job_description
- [x] Player self-profile CTA changed away from Invite to Tryout
- [x] Player avatar upload action implemented and wired to profile header
- [x] Dashboard navbar now consumes persisted avatar_url
- [x] Settings page includes org logo update card and server action for owner/manager
- [x] Admin dashboard expanded with Users tab and platform KPIs
- [x] Admin suspend/reactivate action implemented with self-lockout prevention
- [ ] Run migration in Supabase environment and validate RLS behavior live
- [ ] Add/adjust tests for new schema fields and moderation/media actions

---

## Phase 1 - Schema and Policy Foundation

### 1.1 Database migrations

- [ ] Add nullable column on tryouts: job_description text
- [ ] Add nullable column on player_profiles: avatar_url text
- [ ] Add account moderation field on users (pick one and stay consistent):
- [ ] Option A: is_suspended boolean default false
- [ ] Option B: account_status enum with ACTIVE and SUSPENDED
- [ ] Add updated SQL migration file under supabase with clear name and date
- [ ] Add rollback notes in migration comments

### 1.2 RLS and storage policy checks

- [ ] Ensure players can only update their own avatar_url
- [ ] Ensure org OWNER or MANAGER can update only their org logo_url
- [ ] Ensure only PLATFORM_ADMIN can set user suspension state
- [ ] Confirm storage buckets/policies for avatars and organization_logos are compatible
- [ ] Verify object path conventions are deterministic and replace-safe

### 1.3 Type updates

- [ ] Update generated/hand-authored types in frontend/lib/database.types.ts
- [ ] Confirm all affected inserts/updates compile after type changes

### Phase 1 done when

- [ ] Migration applies cleanly
- [ ] Policies pass manual role checks (PLAYER, ORG_MEMBER/ADMIN, PLATFORM_ADMIN)
- [ ] TypeScript has zero new type errors

---

## Phase 2 - Tryout Job Description End-to-End

### 2.1 Create/Edit form wiring

Files:

- frontend/app/(recruiter)/org/(mgmt)/tryouts/new/_components/NewTryoutForm.tsx
- frontend/app/(recruiter)/org/(mgmt)/tryouts/new/actions.ts

Checklist:

- [ ] Keep role requirements field as requirements
- [ ] Add dedicated job_description field in form data
- [ ] Remove hidden merge logic that combines description into requirements
- [ ] Validate and persist job_description in createTryout
- [ ] Validate and persist job_description in updateTryout
- [ ] Prefill job_description in edit and view modes

### 2.2 Display surfaces

Files:

- frontend/app/(dashboard)/dashboard/tryouts/page.tsx
- frontend/app/(dashboard)/dashboard/tryouts/_components/TryoutFilterGrid.tsx
- frontend/app/(dashboard)/dashboard/applications/[applicationId]/page.tsx
- frontend/app/(recruiter)/org/(mgmt)/tryouts/_components/MyTryoutsManager.tsx (if detail preview needed)

Checklist:

- [ ] Show concise requirements and separate job description block
- [ ] Keep card density readable on mobile
- [ ] Avoid duplicate long text in compact cards
- [ ] Ensure application detail shows both sections clearly

### Phase 2 done when

- [ ] Recruiter can create/edit/publish tryout with separate job description
- [ ] Player can view job description in tryout browsing and application detail
- [ ] Existing requirements behavior remains intact

---

## Phase 3 - Player Profile CTA Fix and Avatar Upload

### 3.1 Self-profile action correction

File:

- frontend/app/(dashboard)/dashboard/player/_components/ProfileHeader.tsx

Checklist:

- [ ] Replace self-view Invite to Tryout button with Edit Profile action
- [ ] Keep optional secondary action (for example Share Profile or More menu)
- [ ] Keep visual style aligned with GameFolio theme

### 3.2 Avatar persistence and upload

Files:

- frontend/app/(dashboard)/dashboard/player/actions.ts
- frontend/app/(dashboard)/dashboard/player/page.tsx
- frontend/lib/queries.ts
- frontend/app/(dashboard)/dashboard/layout.tsx
- frontend/components/layout/PlayerNavbar.tsx
- frontend/components/layout/UserDropdownMenu.tsx

Checklist:

- [ ] Add safe-action for avatar upload with validation:
- [ ] image type only
- [ ] max file size
- [ ] deterministic object path under avatars bucket
- [ ] Save public URL to player_profiles.avatar_url
- [ ] Pass avatarUrl through query to page, navbar, and dropdown
- [ ] Add replace flow (new upload overwrites DB reference)
- [ ] Add remove/reset flow (optional if time allows)

### Phase 3 done when

- [ ] Player can upload avatar and see it in profile header, navbar, and dropdown
- [ ] Self profile no longer shows recruiter-only invite language
- [ ] Unauthorized user cannot change another profile avatar

---

## Phase 4 - Organization Logo Post-Creation Update

### 4.1 Add org logo edit entry point

Files:

- frontend/app/(dashboard)/dashboard/settings/page.tsx or org management settings route
- frontend/app/(recruiter)/org/create/_components/OrgCreateForm.tsx (reuse UX pattern)
- frontend/app/(recruiter)/org/create/actions.ts (extract reusable upload helper if needed)

Checklist:

- [ ] Add org logo update UI in an authenticated org management surface
- [ ] Validate image type and file size
- [ ] Upload to organization_logos bucket and persist organizations.logo_url
- [ ] Restrict updates to OWNER and MANAGER
- [ ] Reflect updated logo in org navbar and lists

### Phase 4 done when

- [ ] OWNER and MANAGER can replace logo after org creation
- [ ] MEMBER and non-members are blocked from updates

---

## Phase 5 - Admin User Management and Platform Dashboard

### 5.1 Platform metrics and tabs

Files:

- frontend/app/(admin)/admin/page.tsx
- frontend/app/(admin)/admin/_components/AdminDashboardContent.tsx

Checklist:

- [ ] Add platform KPI cards (users, orgs, total tryouts, active tryouts, pending applications)
- [ ] Add Users tab next to Organizations and Tryouts
- [ ] Keep dark-mode GameFolio card and tab language consistent

### 5.2 User management table and actions

Files:

- frontend/app/(admin)/admin/_components/AdminUsersTable.tsx (new)
- frontend/app/(admin)/admin/actions.ts

Checklist:

- [ ] Build searchable users table with role badges
- [ ] Show account state (active or suspended)
- [ ] Add suspend and reactivate actions (server actions)
- [ ] Add strict admin guard in action handlers
- [ ] Revalidate admin views after actions

### 5.3 Role safety constraints

- [ ] Prevent self-lockout scenario for the currently signed-in admin
- [ ] Prevent non-admin role escalation through direct requests
- [ ] Log/return clear error messaging for blocked operations

### Phase 5 done when

- [ ] Admin can manage user account state from admin dashboard
- [ ] Non-admin cannot access or execute moderation actions
- [ ] Existing org and tryout moderation remains functional

---

## Phase 6 - Verification and Signoff

### 6.1 Unit, action, and component tests

- [ ] Add tests for tryout job_description create/update/display
- [ ] Add tests for avatar upload validation and persistence
- [ ] Add tests for org logo update authorization
- [ ] Add tests for admin suspend/reactivate authorization
- [ ] Update snapshots/selectors only where behavior changed intentionally

### 6.2 E2E checks

- [ ] Player uploads avatar and sees it in navbar/dropdown
- [ ] Recruiter edits org logo and sees it in org nav
- [ ] Recruiter creates tryout with job_description and player sees it
- [ ] Admin can suspend/reactivate user
- [ ] Suspended user behavior is defined and enforced

### 6.3 Regression and security checklist

- [ ] Run action/component suite (Vitest)
- [ ] Run key role-flow Playwright specs
- [ ] Verify no new RLS bypass paths
- [ ] Verify no TS or lint errors in changed files

### Phase 6 done when

- [ ] All required tests pass
- [ ] Manual role checks pass
- [ ] No critical regressions in auth, dashboard mode switching, or application flow

---

## Release Readiness Checklist

- [ ] Migration SQL reviewed and approved
- [ ] Environment variables and storage buckets verified in target environment
- [ ] Backward compatibility validated for existing tryouts without job_description
- [ ] Documentation updated for new fields and moderation behavior
- [ ] Demo script updated for admin, player, and recruiter workflows

## Suggested Branch and Commit Strategy

- [ ] Branch 1: schema-and-types
- [ ] Branch 2: tryout-job-description
- [ ] Branch 3: player-avatar-and-cta
- [ ] Branch 4: org-logo-update
- [ ] Branch 5: admin-user-management-platform-dashboard
- [ ] Final: regression fixes and docs
