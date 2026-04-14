# GameFolio Testing Plan (Current Features)

Date: 2026-04-12
Scope: Current MVP feature set in frontend only

## Status Update (2026-04-14)

- P0: Completed (tests added and passing).
- P1: Completed (tests added and passing).
- P2: Completed (component UX assertions + expanded smoke checks added).

## 1) Current Baseline

- Unit/action/component tests (Vitest): 22 files, 160 tests, all passing.
- E2E tests (Playwright): 6 files, 39 tests defined.
- Existing E2E coverage includes auth guards, player journey, recruiter journey, admin moderation journey, and production smoke checks.

## 2) Testing Objectives

- Protect auth/session correctness with Supabase SSR cookie flow.
- Enforce role boundaries for PLAYER, ORG roles (OWNER/MANAGER/MEMBER), and PLATFORM_ADMIN.
- Catch RLS-sensitive regressions in server actions before release.
- Keep deterministic CI signal (fast action/unit checks first, then e2e).

## 3) Feature Coverage Matrix

## Auth, Session, and Routing

- Current coverage:
  - login/signup server actions tested.
  - auth guard redirects and wrong-password UX tested in E2E.
- Gaps:
  - No direct tests for auth routes: signout route, confirm route, dashboard switch-mode route.
  - No targeted tests for session cookie lifecycle edge cases.
- Plan:
  - Add route handler tests for:
    - POST /auth/signout clears app session cookie and redirects to /login.
    - GET /auth/confirm handles valid token redirect and invalid token to /error.
    - GET /dashboard/switch-mode validates mode and sanitizes next param.
  - Add focused E2E for mode-switch persistence via gf_nav_mode cookie.

## Player Profile and Portfolio

- Current coverage:
  - upsertGameStats, togglePlayerAvailability, uploadPlayerAvatar partially covered.
  - Player end-to-end flow covers onboarding, edit stats, tryout apply, application status.
- Gaps:
  - No tests for updatePlayerProfile, updatePlayerExtras, updateHardwareDetails, updateCompetitiveExperience.
  - No tests for uploadPlayerHighlight and deletePlayerHighlight.
  - File limit and MIME edge cases not fully covered for avatar/highlight uploads.
- Plan:
  - Add action tests for each missing player action covering:
    - unauthenticated, missing profile, validation failure, DB/storage failure, success + revalidation.
  - Add component tests for profile edit forms (error message rendering and submission wiring).
  - Add one E2E happy-path for highlight upload/delete if fixture media is available.

## Tryouts and Applications (Player + Recruiter)

- Current coverage:
  - applyToTryout, createTryout, updateTryout (partial), updateApplicationStatus covered.
  - Recruiter/player E2E covers create tryout, apply, and recruiter acceptance.
- Gaps:
  - No tests for recruiter bulk tryout management actions:
    - toggleTryoutStatus
    - deleteTryout
    - bulkManageTryouts
  - updateTryout only has one focused payload test; missing permission/not-found/RLS-block branches.
  - Minimal checks for tryout soft-delete visibility interactions outside admin flow.
- Plan:
  - Add action tests for all org tryout management actions:
    - invalid payload
    - unauthorized org access
    - related application delete failure
    - success with correct revalidation paths
  - Extend updateTryout tests to include RLS error branch and org mismatch branch.
  - Add E2E scenario: recruiter bulk pause/delete and verify player dashboard visibility updates.

## Roster and Org Management

- Current coverage:
  - createOrganization, createRoster, updateOrganizationLogo covered.
  - Recruiter E2E covers org creation and roster creation.
- Gaps:
  - No tests for addRosterMember/removeRosterMember actions.
  - No tests for gamertag normalization/suggestion behavior when adding members.
  - No E2E for roster detail page member management.
- Plan:
  - Add action tests for add/remove roster members (permission, duplicate, suggestions, success).
  - Add component tests for roster members list interaction states.
  - Add E2E flow: add player to roster then remove player; verify count and row changes.

## Admin Moderation

- Current coverage:
  - admin moderation actions and admin e2e path are strong.
- Gaps:
  - No direct action tests for toggleUserSuspension DB-failure branch.
  - No E2E asserting suspended user login denial message end-to-end.
- Plan:
  - Add missing DB-failure action test for user suspension.
  - Add E2E scenario: admin suspends user -> user login blocked -> admin unsuspends.

## Dashboard Layout and Role-Based Navigation

- Current coverage:
  - Indirectly covered by E2E redirects and route access.
- Gaps:
  - No tests around navbar mode selection fallback logic in dashboard layout.
  - No tests validating recruiter-member (MEMBER) behavior differences from OWNER/MANAGER in management routes.
- Plan:
  - Add layout-level tests for nav mode and fallback behavior.
  - Add E2E role matrix checks:
    - MEMBER can view org surfaces but blocked on management actions requiring OWNER/MANAGER.

## 4) Priority and Execution Order

P0 (first)
- Auth route handlers (signout/confirm/switch-mode).
- Untested server actions with role-sensitive writes (tryouts bulk/manage, roster member add/remove).
- updateTryout permission and RLS branches.

P1
- Missing player profile/portfolio action coverage.
- Admin suspension end-to-end regression.
- Dashboard nav mode and role fallback tests.

P2
- Additional component-level UX assertions and expanded smoke checks.
- Tournaments placeholder route smoke only (no deep functional tests until feature is active).

## 5) Test Suite Structure Targets

- Keep unit/action tests as primary gate for business logic and permissions.
- Keep component tests for form wiring, disabled states, and action callbacks.
- Use E2E only for cross-surface journeys and role-boundary regressions.

Suggested additions:
- __tests__/routes/auth-signout.test.ts
- __tests__/routes/auth-confirm.test.ts
- __tests__/routes/switch-mode.test.ts
- __tests__/actions/org-tryouts-management.test.ts
- __tests__/actions/roster-members.test.ts
- __tests__/actions/player-profile-extended.test.ts
- e2e/role-boundary-flow.spec.ts

## 6) Environment and Data Strategy

- Keep deterministic seeded identities for admin/player/recruiter/recruiter-no-org/onboarding-player.
- Maintain dedicated fixture tryouts for duplicate-apply and admin toggle flows.
- Add dedicated roster-member fixture users to avoid cross-test collisions.
- Continue skipping credential-required E2E tests when env vars are absent.

## 7) CI Gates

Recommended quality gates per PR:

- Gate 1 (required): npm run test
- Gate 2 (required on protected branches): Playwright smoke subset
- Gate 3 (nightly or pre-release): Full Playwright suite

Failure policy:

- Any auth/role-boundary regression in action tests is blocking.
- Flaky E2E must be fixed by deterministic state handling, not static waits.

## 8) Definition of Done for This Plan

- All P0 additions implemented and passing in CI.
- No untested server action remains on auth- or role-sensitive write paths.
- At least one E2E flow verifies suspension and one verifies roster member management.
- Test docs updated when new roles/routes/actions are introduced.