# GameFolio Production Deployment Checklist (April 2026)

## 1) Objective
Ship GameFolio to production safely with clear go/no-go gates, repeatable execution steps, and a rollback path.

## 2) Scope
In scope:
- Resolve all release blockers discovered in readiness verification.
- Add required CI quality gates for release confidence.
- Prepare Supabase and Vercel production environments.
- Execute controlled production rollout and post-deploy verification.

Out of scope:
- New MVP features.
- Non-critical UI redesign.
- Schema refactors beyond required migration readiness.

## 3) Status Legend
- [ ] not started
- [~] in progress
- [x] complete

## 4) Release Gate Policy (Must Pass)
- [x] Gate A: `npm run lint` passes.
- [x] Gate B: `npm run test` passes.
- [x] Gate C: `npm run build` passes.
- [x] Gate D: `npm run test:e2e -- e2e/production-smoke.spec.ts e2e/admin-suspension-flow.spec.ts` passes.
- [~] Gate E: `npm run test:e2e` full suite passes on two consecutive CI runs.

No production deployment is allowed unless all gates are green.

## 5) Phase 0 - Close Current Blockers

### 5.1 Build Blockers
- [x] Fix `useSearchParams()` usage to satisfy Next.js production build requirements.
- [x] Validate `npm run build` is green locally and in CI.

Targets:
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/signup/page.tsx`

### 5.2 Lint Blockers
- [x] Resolve app-level lint errors (react hooks and JSX escape issues).
- [x] Resolve test lint errors or explicitly scope lint policy for tests with team approval.
- [x] Re-run lint until zero errors.

Targets:
- `frontend/app/(dashboard)/dashboard/player/_components/ProfileHeader.tsx`
- `frontend/app/(dashboard)/dashboard/tryouts/_components/ApplyButton.tsx`
- `frontend/app/(recruiter)/org/(mgmt)/rosters/_components/NewRosterModal.tsx`
- `frontend/app/(recruiter)/org/(mgmt)/tryouts/_components/MyTryoutsManager.tsx`
- `frontend/app/(dashboard)/dashboard/applications/_components/ApplicationsList.tsx`
- `frontend/app/(dashboard)/dashboard/player/edit-stats/_components/EditGameStatsForm.tsx`

### 5.3 E2E Stability Blockers
- [x] Stabilize strict-mode locator collisions in player/recruiter/admin flows.
- [x] Remove shared-account race conditions between specs.
- [x] Ensure recruiter-no-org redirection test is isolated from suspension-state mutations.
- [x] Ensure admin tryout activation/deactivation assertion matches actual toast/state behavior.
- [x] Verify all 39 E2E tests pass consistently.

Targets:
- `frontend/e2e/player-flow.spec.ts`
- `frontend/e2e/recruiter-flow.spec.ts`
- `frontend/e2e/admin-flow.spec.ts`
- `frontend/e2e/auth-flow.spec.ts`
- `frontend/e2e/admin-suspension-flow.spec.ts`
- `frontend/e2e/fixtures/auth.ts`

### 5.4 Platform Compatibility Blocker
- [x] Migrate deprecated Next.js middleware convention to proxy convention.
- [x] Verify auth/session behavior remains unchanged after migration.

Target:
- `frontend/middleware.ts`

## 6) Phase 1 - CI Release Gates
- [x] Add a required workflow for lint + unit/action/component tests + production build.
- [~] Keep smoke Playwright workflow required on protected branches.
- [x] Keep full Playwright workflow on nightly and pre-release.
- [~] Mark required checks in repository branch protection settings.

Targets:
- `.github/workflows/playwright-smoke-protected.yml`
- `.github/workflows/playwright-full-nightly.yml`
- `.github/workflows/release-quality-gates.yml` (new)

## 7) Phase 2 - Production Environment Preparation

### 7.1 Supabase Readiness
- [ ] Confirm production backup/snapshot is created before any migration.
- [ ] Apply all required SQL migrations in the intended sequence.
- [ ] Confirm seed baseline exists for game catalogs required by UI.
- [ ] Validate RLS behavior for PLAYER, RECRUITER, and PLATFORM_ADMIN using test accounts.

Targets:
- `supabase/setup.sql`
- `supabase/seed.sql`
- `supabase/week-8-player-profile-media.sql`
- `supabase/week-9-platform-user-management-and-media.sql`
- `supabase/week-10-admin-tryouts-update-rls-fix.sql`
- `supabase/week-10-player-profile-availability.sql`
- `supabase/week-11-admin-tryout-soft-delete.sql`

### 7.2 Vercel and App Config
- [ ] Configure production environment variables.
- [ ] Confirm secrets are not committed and only injected via environment settings.
- [ ] Validate `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are production values.
- [ ] Validate domain, TLS, and redirect behavior.

Targets:
- `frontend/.env.example.local`
- `README.md`

## 8) Phase 3 - Pre-Release Verification Runbook
- [ ] Run `npm ci` in `frontend`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run smoke E2E subset.
- [ ] Run full E2E.
- [ ] Archive command logs and Playwright report artifacts.
- [ ] Complete go/no-go review with evidence from all gates.

Evidence required:
- CI links for all green checks.
- Build artifact confirmation.
- E2E report showing zero failed tests.

## 9) Phase 4 - Production Deployment Day
- [ ] Announce deployment window and freeze merges.
- [ ] Create release tag and release notes.
- [ ] Reconfirm DB backup timestamp.
- [ ] Deploy to Vercel production.
- [ ] Run post-deploy smoke checks immediately.
- [ ] Verify critical role flows:
- [ ] PLAYER: login, onboarding guard, browse tryouts, apply, view applications.
- [ ] RECRUITER: org management, create/update tryout, review applications.
- [ ] ADMIN: dashboard access, moderation actions, suspension flow.
- [ ] Remove freeze once verification is complete.

## 10) Phase 5 - Post-Deploy Monitoring (First 24 Hours)
- [ ] Monitor application logs for auth, RLS, and server action errors.
- [ ] Monitor elevated 4xx/5xx trends and latency spikes.
- [ ] Monitor failed login and suspended-account message rates.
- [ ] Perform two scheduled manual sanity checks (T+1h, T+24h).
- [ ] Record findings and open follow-up fixes for non-blocking issues.

## 11) Rollback Plan

Rollback triggers:
- [ ] Auth failures affecting login/session continuity.
- [ ] RLS regressions exposing or blocking protected data paths.
- [ ] Critical role flow failure for PLAYER, RECRUITER, or ADMIN.

Rollback actions:
- [ ] Roll back Vercel deployment to previous stable release.
- [ ] If migration caused regression, execute DB rollback strategy from snapshot/backup.
- [ ] Run smoke tests on rolled-back version.
- [ ] Publish incident summary and remediation plan.

## 12) Definition of Done
- [ ] All release gates in Section 4 are green.
- [ ] Production deployment completed and verified.
- [ ] No Sev-1/Sev-2 issues in first 24 hours.
- [ ] Deployment evidence and outcomes documented in project plan logs.
