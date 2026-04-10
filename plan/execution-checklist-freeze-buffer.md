# Execution Checklist - Freeze/Buffer Work

Status legend:
- [ ] not started
- [~] in progress
- [x] complete

## A) E2E Fixture and Seeding Foundation
- [x] Add seeded E2E identities (player, recruiter-owner, admin)
- [x] Add idempotent SQL seed for org/roster/tryout/application graph
- [x] Add Playwright auth/session bootstrap helpers
- [x] Add deterministic test IDs and reset strategy
- [~] Verify local and CI E2E bootstrapping without manual login

## B) Complete 25 TODO E2E Scenarios

### admin-flow.spec.ts (7)
- [x] 1: player blocked from /admin
- [x] 2: platform admin can access /admin
- [x] 3: admin org table verification
- [x] 4: admin tryout table verification
- [x] 5: admin deactivate tryout
- [x] 6: deactivated tryout hidden from player browse
- [x] 7: admin reactivate tryout

### auth-flow.spec.ts (2)
- [x] 3: authenticated user redirected from /login
- [x] 4: no-org user redirected to /org/create

### player-flow.spec.ts (6)
- [x] 2: onboarding submit redirects to dashboard
- [x] 3: edit stats and persist
- [x] 4: browse tryouts shows active cards
- [x] 5: apply to tryout success
- [x] 6: applications shows PENDING
- [x] 7: duplicate apply blocked

### recruiter-flow.spec.ts (9)
- [x] 1: /org/create visible for new recruiter
- [x] 2: create org redirects to rosters
- [x] 3: create roster appears
- [x] 4: manage tryouts page opens
- [x] 5: publish tryout redirects to applications
- [x] 6: player sees published tryout
- [x] 7: player application appears for recruiter
- [x] 8: recruiter accepts application
- [x] 9: player sees accepted status

### production-smoke.spec.ts (1)
- [x] 3: seeded test account login pass

## C) Admin Delete Moderation Slice
- [x] Add migration for tryout soft-delete fields (`deleted_at`, `deleted_by`)
- [x] Add/adjust RLS policies for admin moderation updates
- [x] Add admin action: delete tryout (soft-delete)
- [x] Add admin action: restore tryout
- [x] Add UI controls and confirm dialogs in admin tryout table
- [x] Exclude deleted tryouts from player/recruiter listing queries
- [x] Add unit/action tests for delete/restore permissions and behavior
- [x] Add E2E coverage for delete/restore visibility effects

## D) Auth/Role Enforcement Pattern Decision and Documentation
- [x] Publish official pattern: middleware auth + layout/action authorization
- [x] Add examples for route guards and action-level role checks
- [x] Add anti-pattern notes (no role-only middleware DB dependency)

## E) Context and README Refresh
- [x] Update context docs naming to `users`, `user_roles`, `player_profiles`
- [x] Update auth flow narrative and onboarding sequence
- [x] Update moderation capability docs for delete/restore behavior
- [x] Update README with current auth/role model and testing commands

## F) Release Gates
- [x] Unit/action/component tests green
- [~] E2E suite green on two consecutive CI runs
- [x] No blocker regressions in browse/apply/admin moderation
- [x] Checklist reviewed and signed off
