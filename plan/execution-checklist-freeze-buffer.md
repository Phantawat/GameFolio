# Execution Checklist - Freeze/Buffer Work

Status legend:
- [ ] not started
- [~] in progress
- [x] complete

## A) E2E Fixture and Seeding Foundation
- [ ] Add seeded E2E identities (player, recruiter-owner, admin)
- [ ] Add idempotent SQL seed for org/roster/tryout/application graph
- [ ] Add Playwright auth/session bootstrap helpers
- [ ] Add deterministic test IDs and reset strategy
- [ ] Verify local and CI E2E bootstrapping without manual login

## B) Complete 25 TODO E2E Scenarios

### admin-flow.spec.ts (7)
- [ ] 1: player blocked from /admin
- [ ] 2: platform admin can access /admin
- [ ] 3: admin org table verification
- [ ] 4: admin tryout table verification
- [ ] 5: admin deactivate tryout
- [ ] 6: deactivated tryout hidden from player browse
- [ ] 7: admin reactivate tryout

### auth-flow.spec.ts (2)
- [ ] 3: authenticated user redirected from /login
- [ ] 4: no-org user redirected to /org/create

### player-flow.spec.ts (6)
- [ ] 2: onboarding submit redirects to dashboard
- [ ] 3: edit stats and persist
- [ ] 4: browse tryouts shows active cards
- [ ] 5: apply to tryout success
- [ ] 6: applications shows PENDING
- [ ] 7: duplicate apply blocked

### recruiter-flow.spec.ts (9)
- [ ] 1: /org/create visible for new recruiter
- [ ] 2: create org redirects to rosters
- [ ] 3: create roster appears
- [ ] 4: manage tryouts page opens
- [ ] 5: publish tryout redirects to applications
- [ ] 6: player sees published tryout
- [ ] 7: player application appears for recruiter
- [ ] 8: recruiter accepts application
- [ ] 9: player sees accepted status

### production-smoke.spec.ts (1)
- [ ] 3: seeded test account login pass

## C) Admin Delete Moderation Slice
- [ ] Add migration for tryout soft-delete fields (`deleted_at`, `deleted_by`)
- [ ] Add/adjust RLS policies for admin moderation updates
- [ ] Add admin action: delete tryout (soft-delete)
- [ ] Add admin action: restore tryout
- [ ] Add UI controls and confirm dialogs in admin tryout table
- [ ] Exclude deleted tryouts from player/recruiter listing queries
- [ ] Add unit/action tests for delete/restore permissions and behavior
- [ ] Add E2E coverage for delete/restore visibility effects

## D) Auth/Role Enforcement Pattern Decision and Documentation
- [ ] Publish official pattern: middleware auth + layout/action authorization
- [ ] Add examples for route guards and action-level role checks
- [ ] Add anti-pattern notes (no role-only middleware DB dependency)

## E) Context and README Refresh
- [ ] Update context docs naming to `users`, `user_roles`, `player_profiles`
- [ ] Update auth flow narrative and onboarding sequence
- [ ] Update moderation capability docs for delete/restore behavior
- [ ] Update README with current auth/role model and testing commands

## F) Release Gates
- [ ] Unit/action/component tests green
- [ ] E2E suite green on two consecutive CI runs
- [ ] No blocker regressions in browse/apply/admin moderation
- [ ] Checklist reviewed and signed off
