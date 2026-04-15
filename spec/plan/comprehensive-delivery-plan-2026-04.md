# GameFolio Comprehensive Delivery Plan (April 2026)

## 1) Objective
Deliver production-ready stabilization across testing, moderation, auth enforcement clarity, and documentation alignment within freeze/buffer scope.

## 2) Scope
In scope:
- Implement real Playwright E2E fixtures, auth seeding, and complete 25 TODO scenarios.
- Add admin delete moderation actions with RLS-safe SQL and tests.
- Decide and document the official role-enforcement pattern.
- Refresh context docs to match current schema and auth model.
- Track all remaining work in a lightweight execution checklist.

Out of scope:
- New product features outside existing MVP boundaries.
- Architecture rewrites unrelated to the stabilization goals.

## 3) Decision: Role Enforcement Strategy
Decision:
- Keep authentication gate in middleware.
- Keep role authorization in layouts and server actions.

Rationale:
- Current code already enforces role checks in server-side layouts/actions.
- Role checks in middleware require extra DB lookups on every request and increase edge complexity.
- Server-side layouts/actions remain the trust boundary and are easier to audit with tests.

Required follow-up:
- Document this as the official pattern in context docs and README.
- Add tests that prove protected routes and actions reject wrong roles.

## 4) Workstreams

### Workstream A: E2E Fixtures and Auth Seeding
Goal:
- Make E2E deterministic and runnable in CI/local without manual setup.

Tasks:
- Add seed identities and role assignments for: player, recruiter-owner, admin.
- Add idempotent seed SQL for organizations, rosters, tryouts, and baseline applications.
- Add Playwright helpers for login/session bootstrap (storage state or direct auth cookie setup).
- Add stable test data IDs and test cleanup/reset strategy.

Deliverables:
- `frontend/e2e/fixtures/*` helper modules.
- `supabase/*` seed/update SQL for E2E users and baseline graph.
- `frontend/playwright.config.ts` projects/env profile for local and CI.

Acceptance criteria:
- `npm run test:e2e` runs with no manual account creation.
- Re-running tests on a clean DB is deterministic.

### Workstream B: Complete 25 TODO E2E Scenarios
Goal:
- Convert all TODO/skip cases into executable assertions.

Scenario inventory (25):
- `frontend/e2e/admin-flow.spec.ts`: 7
- `frontend/e2e/auth-flow.spec.ts`: 2
- `frontend/e2e/player-flow.spec.ts`: 6
- `frontend/e2e/recruiter-flow.spec.ts`: 9
- `frontend/e2e/production-smoke.spec.ts`: 1

Implementation order:
1. Auth guards (fast fail/fast signal).
2. Player flow.
3. Recruiter flow.
4. Admin flow.
5. Production smoke seeded login.

Acceptance criteria:
- 25 TODO scenarios implemented and unskipped.
- E2E suite green in CI on two consecutive runs.

### Workstream C: Admin Delete Moderation Actions + RLS + Tests
Goal:
- Add safe deletion moderation capability aligned with admin responsibilities.

Design decision:
- Use soft delete first for auditability and rollback safety.
- Keep hard delete as optional follow-up behind explicit confirmation.

DB plan:
- Add `deleted_at`, `deleted_by` to `public.tryouts`.
- Add admin update policy allowing `PLATFORM_ADMIN` to set delete fields.
- Ensure public/player/recruiter queries exclude deleted rows.

Application plan:
- Add admin action: `deleteTryoutModeration` (soft-delete).
- Add admin action: `restoreTryoutModeration`.
- Add UI controls in admin tryout table with confirmation.
- Update dashboard and browse filters to exclude deleted rows.

Test plan:
- Action tests for permission checks and state transitions.
- Component tests for delete/restore controls.
- E2E admin moderation scenario update.

Acceptance criteria:
- Admin can delete/restore tryouts.
- Deleted tryouts disappear from player browse and recruiter active management views.
- Non-admin deletion attempts fail.

### Workstream D: Official Auth/Authorization Pattern Documentation
Goal:
- Remove ambiguity on where auth vs authorization checks belong.

Tasks:
- Add explicit policy section in context docs:
  - Middleware: auth/session/suspension checks.
  - Layout/action: role and ownership checks.
- Add code examples and anti-patterns.

Acceptance criteria:
- New contributors can implement protected routes/actions without policy drift.

### Workstream E: Context Docs Refresh (Schema/Auth Naming Alignment)
Goal:
- Align docs with current implementation naming and workflow.

Target docs:
- `spec/context/CONTEXT.md`
- `spec/context/ARCHITECTURE.md`
- `spec/context/SCHEMA.md`
- `README.md`

Key updates:
- Replace ambiguous `profiles` references with `users`, `user_roles`, `player_profiles`.
- Clarify onboarding flow and role assignment source of truth.
- Clarify admin moderation capabilities and soft-delete semantics.

Acceptance criteria:
- No contradictory naming between docs and code.
- Auth and role flow diagrams reflect real tables and guards.

### Workstream F: Freeze/Buffer Tracking
Goal:
- Track completion with objective checkboxes and gate criteria.

Deliverable:
- `plan/execution-checklist-freeze-buffer.md` with owners/status and acceptance gates.

## 5) Milestones and Sequence

Milestone 1 (Day 1-2): E2E foundation
- Workstream A complete.
- First 5 auth/player tests green.

Milestone 2 (Day 3-4): Full E2E completion
- Workstream B complete all 25 scenarios.
- CI E2E stable on two runs.

Milestone 3 (Day 5-6): Moderation delete slice
- Workstream C migration + actions + tests complete.

Milestone 4 (Day 7): Auth pattern decision publication
- Workstream D complete and reviewed.

Milestone 5 (Day 8): Docs alignment
- Workstream E complete.

Milestone 6 (Day 9-10): Buffer
- Regression pass, bug fixes, release notes.

## 6) Risks and Mitigations
- Risk: Flaky E2E due to shared mutable state.
  - Mitigation: idempotent seeding + deterministic IDs + test isolation/reset hooks.
- Risk: RLS regressions during moderation-delete rollout.
  - Mitigation: SQL migration review + action tests + negative-role tests.
- Risk: Role policy confusion persists.
  - Mitigation: single documented pattern + examples + checklist gate.

## 7) Definition of Done
- All 25 TODO E2E scenarios implemented and passing.
- Admin delete/restore moderation shipped with RLS and tests.
- Official auth/authorization pattern documented and adopted.
- Context docs and README aligned to current schema and flows.
- Freeze/buffer checklist present and updated to complete.
