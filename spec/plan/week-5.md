# Week 5 – Admin Controls & Polish

**Goal:** System management and core UI cleanup.

## Tasks
- [x] Build the Platform Admin dashboard (requires `PLATFORM_ADMIN` role).
- [x] Implement simple data tables to view all Organizations and Tryouts.
- [x] Add moderation capabilities (e.g., toggling `is_active` to false on a malicious tryout).
- [x] Standardize all loading states (`loading.tsx` skeletons).
- [x] Implement global error handling and toast notifications for user actions.
- [x] Build custom UI components (RankBadge, GameIcon, TryoutCard, StatRow, ExperienceTimeline).
- [x] Add tryout search filtering (by game, role, and text search).
- [x] Add application message input (Dialog-based apply flow).
- [x] Add roster member management (add/remove members by gamertag).
- [x] Set up Playwright E2E test infrastructure (config, auth-flow, player-flow, recruiter-flow, admin-flow, production-smoke stubs).
- [x] Write admin moderation action tests (`toggleTryoutActive` — 7 test cases).
- [x] Write admin component tests (`AdminOrgsTable` — 3 tests, `AdminTryoutsTable` — 5 tests).
- [x] Fix ApplyButton tests for Dialog-based component.

**Deliverable:** Full 3-role architecture complete and stable.

---

## 🧪 Testing Rule

> **After completing each task, write the corresponding tests before checking the box.**
> Refer to [`test-plan.md`](./test-plan.md) for the planned test cases for each week.
