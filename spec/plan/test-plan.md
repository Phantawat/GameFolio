# GameFolio – Test Plan (Weeks 1–4)

## Recommended Stack

| Layer | Tool | Why |
|---|---|---|
| Test Runner | **Vitest** | Fast, native ESM, works with Next.js App Router |
| Component Tests | **@testing-library/react** + **@testing-library/user-event** | Tests UI from the user's perspective |
| API / Action Mocks | **MSW (Mock Service Worker)** | Intercepts Supabase HTTP calls without touching the real DB |
| E2E | **Playwright** | Full browser automation for critical flows |

### Setup Commands
```bash
npm install -D vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom msw \
  playwright @playwright/test
```

---

## File Structure
```
frontend/
  __tests__/
    unit/
      lib/
        safe-action.test.ts      ← wrapper logic
        utils.test.ts
    actions/
      auth.test.ts
      onboarding.test.ts
      player-stats.test.ts
      apply-to-tryout.test.ts
      org-create.test.ts
      org-rosters.test.ts
      org-tryouts.test.ts
      org-applications.test.ts
      admin-moderation.test.ts   ← Week 5
    components/
      ApplyButton.test.tsx
      NewRosterModal.test.tsx
      ApplicationsTable.test.tsx
      AdminOrgsTable.test.tsx    ← Week 5
      AdminTryoutsTable.test.tsx ← Week 5
  e2e/
    auth-flow.spec.ts
    player-flow.spec.ts
    recruiter-flow.spec.ts
    admin-flow.spec.ts           ← Week 5
    production-smoke.spec.ts     ← Week 7
```

---

## 1. Unit Tests

### `lib/safe-action.ts` — createSafeAction wrapper
| # | Test Case | Expected |
|---|---|---|
| 1 | Unauthenticated user (no session) calls any action | `{ error: 'You must be logged in...' }` |
| 2 | Zod validation fails (e.g. missing required field) | `{ error: '...', fieldErrors: {...} }` |
| 3 | Auth passes + validation passes → handler is called with typed data and `ctx.user` / `ctx.supabase` | Handler result returned as-is |
| 4 | Handler returns `{ error: '...' }` | Action returns it unchanged |
| 5 | Handler returns `{ success: '...' }` | Action returns it unchanged |

### `lib/utils.ts` — cn()
| # | Test Case | Expected |
|---|---|---|
| 1 | `cn('a', 'b')` | `'a b'` |
| 2 | `cn('a', undefined, 'b')` | `'a b'` |
| 3 | Conflicting Tailwind classes (e.g. `bg-red-500 bg-blue-500`) | Last class wins via tailwind-merge |

---

## 2. Server Action Tests

All action tests mock the Supabase client. Use MSW or `vi.mock('@/lib/supabase/server')`.

---

### Week 2 — `app/auth/actions.ts`

#### `login()`
| # | Input | Expected |
|---|---|---|
| 1 | Empty email | `{ error: 'Please enter a valid email address', fieldErrors: {...} }` |
| 2 | Invalid email format | `{ error: ..., fieldErrors: {...} }` |
| 3 | Password < 6 chars | `{ error: ..., fieldErrors: {...} }` |
| 4 | Valid form, Supabase returns `AuthApiError` | `{ error: authError.message }` |
| 5 | Valid form, authenticated, **no** player_profile row | Redirects to `/onboarding` |
| 6 | Valid form, authenticated, player_profile exists | Redirects to `/dashboard/player` |

#### `signup()`
| # | Input | Expected |
|---|---|---|
| 1 | Invalid email | `{ error, fieldErrors }` |
| 2 | Password < 6 chars | `{ error, fieldErrors }` |
| 3 | Supabase `signUp` returns error | `{ error: error.message }` |
| 4 | Successful signup | `{ success: '...' }` (email confirmation message) |

---

### Week 2 — `app/onboarding/actions.ts`

#### `completeOnboarding()`
| # | Input | Expected |
|---|---|---|
| 1 | Gamertag is 1 character | `{ fieldErrors: { gamertag: ['...at least 2 characters'] } }` |
| 2 | Valid gamertag + region, DB success | Upserts into `player_profiles`, redirects to `/dashboard/player` |
| 3 | DB returns error | `{ error: db error message }` |
| 4 | Unauthenticated call | `{ error: 'You must be logged in...' }` |

---

### Week 3 — `app/(dashboard)/dashboard/player/actions.ts`

#### `upsertGameStats()`
| # | Input | Expected |
|---|---|---|
| 1 | `game_id` is not a UUID | `{ fieldErrors: { game_id: ['Please select a game'] } }` |
| 2 | `rank` is empty string | `{ fieldErrors: { rank: [...] } }` |
| 3 | `win_rate` = 150 (> 100) | `{ fieldErrors: { win_rate: [...] } }` |
| 4 | Authenticated, no player_profile row | `{ error: 'Player profile not found...' }` |
| 5 | Valid data, DB success | Upserts `player_game_stats`, revalidates `/dashboard/player` |
| 6 | DB error | `{ error: db error message }` |

---

### Week 3 — `app/(dashboard)/dashboard/tryouts/actions.ts`

#### `applyToTryout()`
| # | Input | Expected |
|---|---|---|
| 1 | `tryout_id` not a UUID | `{ fieldErrors: {...} }` |
| 2 | Authenticated but no player_profile | `{ error: 'Player profile not found. Please complete onboarding.' }` |
| 3 | Valid, DB returns `23505` (duplicate) | `{ error: 'You have already applied to this tryout.' }` |
| 4 | Valid, DB success | `{ success: 'Application submitted successfully!' }` + revalidates paths |
| 5 | Valid, generic DB error | `{ error: 'Failed to submit application. Please try again.' }` |

---

### Week 4 — `app/(recruiter)/org/create/actions.ts`

#### `createOrganization()`
| # | Input | Expected |
|---|---|---|
| 1 | Unauthenticated | `{ error: 'You must be logged in...' }` |
| 2 | `name` is empty / 1 char | `{ error: 'Organization name must be at least 2 characters.' }` |
| 3 | DB returns `23505` on org insert | `{ error: 'An organization with this name already exists.' }` |
| 4 | Org inserted but `organization_members` insert fails | `{ error: 'Organization created but failed to set up membership.' }` |
| 5 | Valid, all inserts succeed | Creates org + OWNER membership + ORG_ADMIN role → redirects to `/org/rosters` |
| 6 | Logo file provided but storage upload fails | Org is still created with `logo_url: null` (graceful fallback) |

---

### Week 4 — `app/(recruiter)/org/(mgmt)/rosters/actions.ts`

#### `createRoster()`
| # | Input | Expected |
|---|---|---|
| 1 | User has no membership (or role = `MEMBER`) | `{ error: 'You do not have permission to manage this organization.' }` |
| 2 | `game_id` not a UUID | `{ fieldErrors: { game_id: ['Please select a game.'] } }` |
| 3 | `name` < 2 chars | `{ fieldErrors: { name: [...] } }` |
| 4 | DB returns `23505` (duplicate name+game) | `{ error: 'A roster with this name already exists for this game.' }` |
| 5 | Valid, OWNER/MANAGER user, DB success | `{ success: 'Roster created successfully!' }` + revalidates `/org/rosters` |

---

### Week 4 — `app/(recruiter)/org/(mgmt)/tryouts/new/actions.ts`

#### `createTryout()`
| # | Input | Expected |
|---|---|---|
| 1 | User not OWNER/MANAGER of the org | `{ error: 'You do not have permission to post tryouts...' }` |
| 2 | `title` < 3 chars | `{ fieldErrors: { title: [...] } }` |
| 3 | `is_active = 'false'`, DB success | `{ success: 'Tryout saved as draft.' }` |
| 4 | `is_active = 'true'`, DB success | Redirects to `/org/applications` |
| 5 | `role_needed_id = ''` (empty string) | Stored as `null` (no DB constraint error) |
| 6 | DB error on insert | `{ error: 'Failed to create tryout. Please try again.' }` |

---

### Week 4 — `app/(recruiter)/org/(mgmt)/applications/actions.ts`

#### `updateApplicationStatus()`
| # | Input | Expected |
|---|---|---|
| 1 | `application_id` not a UUID | `{ fieldErrors: {...} }` |
| 2 | `status` is not `REVIEWING/ACCEPTED/REJECTED` | `{ fieldErrors: {...} }` |
| 3 | Application not found in DB | `{ error: 'Application not found.' }` |
| 4 | Application found, but user is not OWNER/MANAGER of the linked org | `{ error: 'Permission denied.' }` |
| 5 | Valid, status = `REVIEWING` | Updates application, revalidates `/org/applications`, returns `{ success: 'Application marked as reviewing.' }` |
| 6 | Valid, status = `ACCEPTED` | Same as above |
| 7 | Valid, status = `REJECTED` | Same as above |
| 8 | DB update fails | `{ error: 'Failed to update application status.' }` |

---

## 3. Component Tests

### `ApplyButton`
| # | Scenario | Expected |
|---|---|---|
| 1 | `alreadyApplied=true` | Renders a disabled `"Applied"` button; no form submission |
| 2 | `alreadyApplied=false` | Renders an `"Apply Now"` button |
| 3 | Click "Apply Now" | Hidden input `tryout_id` is present; form submits |
| 4 | While pending (action in flight) | Shows `<Loader2>` spinner, button disabled |
| 5 | Action returns `{ error }` | `toast.error` is called |
| 6 | Action returns `{ success }` | `toast.success` is called |

### `NewRosterModal`
| # | Scenario | Expected |
|---|---|---|
| 1 | Initial render | Modal is closed (content not visible) |
| 2 | Click "New Roster" trigger | Dialog opens, form fields visible |
| 3 | Click "Cancel" | Dialog closes |
| 4 | Submit with no game selected | `game_id` select is required; native browser blocks submit |
| 5 | Submit with valid data | `createRoster` action called; on success toast shown + dialog closes |
| 6 | `variant="create-now"` | Renders "Create Now" button instead of "+ New Roster" |

### `ApplicationsTable`
| # | Scenario | Expected |
|---|---|---|
| 1 | Empty `applications` array | Empty state content visible, no `<tr>` rows |
| 2 | Filter = "All" | All application rows rendered |
| 3 | Filter = "Reviewing" | Only rows with `status=REVIEWING` shown |
| 4 | Filter = "Accepted" | Only accepted rows shown |
| 5 | Application with `status=ACCEPTED` | Shows "Processed" text, no action buttons |
| 6 | Application with `status=PENDING` | Shows 👁 + ✓ + ✗ action buttons |
| 7 | Click Accept button | `updateApplicationStatus` called with `{ status: 'ACCEPTED' }` |
| 8 | Stats bar | Shows correct `total`, `pending`, `approvedToday` counts |

---

## 4. E2E Tests (Playwright)

### `auth-flow.spec.ts` — Authentication guards
| # | Scenario | Expected |
|---|---|---|
| 1 | Visit `/dashboard/player` while logged out | Redirected to `/login` |
| 2 | Visit `/org/rosters` while logged out | Redirected to `/login` |
| 3 | Visit `/login` while logged in | Redirected to `/dashboard` |
| 4 | Visit `/org/rosters` logged in but no org membership | Redirected to `/org/create` |
| 5 | Login with wrong password | Error toast shown |

### `player-flow.spec.ts` — Full player journey
| # | Step | Expected |
|---|---|---|
| 1 | Sign up with valid email/password | Redirected to `/onboarding` |
| 2 | Submit gamertag + region on onboarding | Redirected to `/dashboard/player`, gamertag shown in header |
| 3 | Navigate to Edit Stats, pick a game + rank, save | Stats card updates on profile page |
| 4 | Navigate to `/dashboard/tryouts` | Active tryout cards visible |
| 5 | Click "Apply Now" on a tryout | Toast "Application submitted successfully!" |
| 6 | Navigate to `/dashboard/applications` | The applied tryout appears with status `PENDING` |
| 7 | Try to apply to same tryout again | Toast "You have already applied to this tryout." |

### `recruiter-flow.spec.ts` — Full recruiter journey
| # | Step | Expected |
|---|---|---|
| 1 | Log in as new user, navigate to `/org/create` | Form with logo upload, name, website displayed |
| 2 | Submit org form with a unique name | Redirected to `/org/rosters` with empty state |
| 3 | Click "New Roster", select Valorant, enter name, submit | Roster card appears in grid |
| 4 | Click "Manage Tryouts" on a roster card | New tryout page pre-fills roster field |
| 5 | Fill tryout form, click "Publish Tryout" | Redirected to `/org/applications` |
| 6 | Published tryout appears on `/dashboard/tryouts` (as a different player user) | Tryout card visible |
| 7 | Player applies to tryout | Application appears in recruiter's `/org/applications` |
| 8 | Recruiter clicks ✓ Accept | Status badge updates to `ACCEPTED`, toast shown |
| 9 | Player's `/dashboard/applications` shows `Accepted` | Status reflected correctly |

---

## 5. Week 5 Tests — Admin Controls & Polish

### `app/(admin)/admin/actions.ts` — `toggleTryoutActive()`
| # | Input | Expected |
|---|---|---|
| 1 | Unauthenticated call | `{ error: 'You must be logged in...' }` |
| 2 | Authenticated but role is `PLAYER` or `ORG_ADMIN` | `{ error: 'Permission denied. Platform admin access required.' }` |
| 3 | `tryout_id` is not a UUID | `{ fieldErrors: { tryout_id: [...] } }` |
| 4 | Tryout not found in DB | `{ error: 'Tryout not found.' }` |
| 5 | `PLATFORM_ADMIN` toggles active tryout to inactive | DB updated, revalidates admin path, `{ success: 'Tryout deactivated.' }` |
| 6 | `PLATFORM_ADMIN` re-activates a deactivated tryout | `{ success: 'Tryout activated.' }` |
| 7 | DB update fails | `{ error: 'Failed to update tryout status.' }` |

### `AdminOrgsTable` component
| # | Scenario | Expected |
|---|---|---|
| 1 | Empty `organizations` prop | Empty state message rendered |
| 2 | Renders org rows | Org name, owner, member count displayed |
| 3 | Search/filter input | Filters rows by org name |

### `AdminTryoutsTable` component
| # | Scenario | Expected |
|---|---|---|
| 1 | Active tryout row | Active badge shown, "Deactivate" button visible |
| 2 | Inactive tryout row | Inactive badge shown, "Activate" button visible |
| 3 | Click "Deactivate" | `toggleTryoutActive` called with correct `tryout_id` and `is_active=false` |
| 4 | On success | Toast shown, row badge updates optimistically |
| 5 | On error | Error toast shown, state unchanged |

### Loading Skeleton Smoke Tests
| # | Scenario | Expected |
|---|---|---|
| 1 | `loading.tsx` renders while page is suspending | Skeleton placeholders visible (no real content flashes in) |
| 2 | Skeleton count matches expected layout | N skeleton rows/cards match the real data layout |

### E2E — `admin-flow.spec.ts`
| # | Step | Expected |
|---|---|---|
| 1 | Visit `/admin` as `PLAYER` user | Redirected to `/dashboard/player` or 403 page |
| 2 | Visit `/admin` as `PLATFORM_ADMIN` user | Admin dashboard loads |
| 3 | Admin views all organizations table | All orgs visible in data table |
| 4 | Admin views all tryouts table | All tryouts visible, each with active status badge |
| 5 | Admin clicks "Deactivate" on an active tryout | Toast success; tryout badge changes to inactive |
| 6 | Deactivated tryout is hidden from the public tryout search page | Player visiting `/dashboard/tryouts` does not see the deactivated tryout |
| 7 | Admin re-activates the tryout | Badge reverts to active; tryout re-appears in public search |

---

## 6. Week 6 Tests — Security & Regression

### RLS Policy Audit (Supabase-Level Tests)
These tests verify that the database itself refuses unauthorized operations, independent of the application layer. Use a direct Supabase client (or `psql`) with a different user's JWT.

| # | Operation | Actor | Expected DB Response |
|---|---|---|---|
| 1 | `SELECT * FROM player_profiles` | Unauthenticated | 0 rows (RLS blocks) |
| 2 | `UPDATE player_profiles SET bio='x' WHERE id=<other_user_id>` | Different authenticated user | 0 rows affected |
| 3 | `INSERT INTO organizations(name) VALUES('hack')` | Any authenticated user | Error (RLS blocks non-owners) |
| 4 | `UPDATE applications SET status='ACCEPTED' WHERE id=<id>` | `PLAYER` user | 0 rows affected |
| 5 | `SELECT * FROM applications` | Player A | Only rows where `player_id = auth.uid()` |
| 6 | `SELECT * FROM tryouts WHERE is_active=false` | Unauthenticated / `PLAYER` | 0 rows (inactive tryouts hidden) |
| 7 | `DELETE FROM organizations WHERE id=<org_id>` | `ORG_MEMBER` (not OWNER) | Error or 0 rows affected |

### Pre-Freeze Regression Tests
Run the full existing test suite before the Week 6 feature freeze. All tests from Weeks 1–5 must pass green. Specific regression focus:

| # | Area | Regression Scenario |
|---|---|---|
| 1 | Auth middleware | `/org` and `/admin` routes still protected after any middleware changes |
| 2 | Onboarding redirect | New signups still land on `/onboarding` before accessing `/dashboard` |
| 3 | Apply button idempotency | Duplicate apply still returns `23505`-based error, not a 500 |
| 4 | Application status update | OWNER/MANAGER can update; `MEMBER` is rejected |
| 5 | Admin toggle | `PLATFORM_ADMIN` can toggle; `ORG_ADMIN` cannot |
| 6 | Responsive layout (Playwright viewport) | Test key pages at `375×812` (mobile) and `1440×900` (desktop) — no overflow, no broken layouts |

---

## 7. Week 7 Tests — Production Smoke

Run these against the live **Vercel production** URL after deployment. They must pass before submission.

### `production-smoke.spec.ts`
| # | Check | Expected |
|---|---|---|
| 1 | Landing page (`/`) loads | 200 OK, hero text visible, no console errors |
| 2 | `/login` renders and form is interactive | Email + password fields present |
| 3 | End-to-end login with a seeded test account | Successfully lands on `/dashboard/player` |
| 4 | Static assets load (fonts, images) | No 404s in network tab |
| 5 | Supabase connection check | `/api/health` or a lightweight query returns 200 |
| 6 | Environment variables are set | No `undefined` values for `NEXT_PUBLIC_SUPABASE_URL` or `ANON_KEY` |
| 7 | Tryout search page loads public data | Active tryouts rendered without authentication |
| 8 | Admin route is blocked for non-admin | Visiting `/admin` while unauthenticated → redirect to `/login` |

---

## Priority Order

| Priority | Area | Reason |
|---|---|---|
| 🔴 Critical | `safe-action.ts` unit tests | Every action depends on this wrapper |
| 🔴 Critical | `applyToTryout` + `updateApplicationStatus` action tests | Core business logic, permission checks |
| 🔴 Critical | `createOrganization` action tests | Only entry point for the recruiter side |
| � Critical | `toggleTryoutActive` action tests (Week 5) | Privileged moderation; wrong permission check = security hole |
| 🟠 High | `login` / `signup` action tests | Auth is a prerequisite for all features |
| 🟠 High | `ApplicationsTable` component test | Complex stateful UI with destructive actions |
| 🟠 High | RLS policy audit (Week 6) | Database-level security must hold independent of app code |
| 🟡 Medium | `ApplyButton` + `NewRosterModal` component tests | Interactive client components |
| 🟡 Medium | E2E Player Flow | Most common user path |
| 🟡 Medium | E2E Admin Flow (Week 5) | Verifies role-gating end-to-end |
| 🟡 Medium | Pre-freeze regression suite (Week 6) | Catches regressions before feature freeze |
| 🟢 Nice-to-have | E2E Recruiter Flow | Full end-to-end coverage |
| 🟢 Nice-to-have | `upsertGameStats` + `createRoster` + `createTryout` action tests | Lower risk but good coverage |
| 🟢 Nice-to-have | Production smoke tests (Week 7) | Final confidence check before submission |
