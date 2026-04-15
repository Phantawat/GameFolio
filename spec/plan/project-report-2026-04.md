# GameFolio Project Report (April 2026)

## 1. Project Overview

GameFolio is a web platform for esports recruiting.
It helps players show their skills and helps organizations find talent.

The project is built as an MVP.
The MVP focus is clear and practical:

- Player portfolio with game stats and highlights
- Tryout posting and application flow
- Recruiter tools for roster and application management
- Admin tools for moderation and user control
- Secure role-based access using Supabase RLS

Main user groups:

- Player
- Recruiter (organization side)
- Platform Admin

Out of scope in this MVP:

- Real-time chat
- Payments
- Native mobile apps
- External game APIs

## 2. System Requirements

### 2.1 Runtime and Platform

- Node.js 20+ recommended
- npm
- Supabase project (Auth, PostgreSQL, Storage)
- Modern browser (Chrome, Edge, Firefox, Safari)

### 2.2 Core Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

For E2E testing, additional test account variables are used.

### 2.3 Main Libraries and Frameworks

- Next.js App Router
- React + TypeScript (strict)
- Tailwind CSS
- shadcn/ui + Lucide React
- Supabase SSR client and server SDK
- Zod for input validation

### 2.4 Test and Quality Tools

- Vitest for unit, action, and component tests
- Playwright for end-to-end tests
- ESLint for linting

## 3. Architecture Characteristics

The architecture has these main characteristics:

- Server-first rendering: pages use Server Components by default
- Clear routing: route groups separate public, auth, dashboard, recruiter, and admin flows
- Layered security: middleware, server checks, and database RLS work together
- Strong typing: database and app logic use shared TypeScript types
- Modular actions: server actions are grouped by feature and route
- Reusable UI system: dark theme with shared components and consistent patterns
- Testable structure: actions and UI are covered by automated tests

## 4. Architecture Design

### 4.1 High-Level Diagram

```mermaid
flowchart TD
    U[User Browser]
    MW[Next.js Proxy Middleware]

    P[(Public and Auth Routes)]
    D[(Player Dashboard Routes)]
    R[(Recruiter Org Routes)]
    A[(Admin Routes)]

    SA[Server Actions via createSafeAction]
    Q[Server Query Layer cache()]

    AU[(Supabase Auth)]
    DB[(Supabase Postgres with RLS)]
    ST[(Supabase Storage)]

    U --> MW
    MW --> P
    MW --> D
    MW --> R
    MW --> A

    P --> SA
    D --> SA
    R --> SA
    A --> SA

    D --> Q
    R --> Q
    A --> Q

    SA --> AU
    Q --> AU

    SA --> DB
    Q --> DB
    SA --> ST
```

### 4.2 Design Description

1. Every request goes through Next.js proxy middleware.
2. Middleware validates session state and blocks protected routes for guests.
3. Route groups keep each user flow separated but still share one app.
4. Server actions process form input with Zod and user checks.
5. Supabase handles auth, SQL queries, and file storage.
6. RLS policies in the database enforce final data access rules.

## 5. Database Design

### 5.1 Main Data Domains

Identity and access:

- users
- user_roles

Player domain:

- player_profiles
- player_game_stats
- player_highlights

Game catalog:

- game_genres
- games
- game_roles

Organization domain:

- organizations
- organization_members
- rosters
- roster_members

Recruitment domain:

- tryouts
- applications

### 5.2 Important Enums

- user_role_type: PLAYER, ORG_MEMBER, ORG_ADMIN, PLATFORM_ADMIN
- organization_member_role: OWNER, MANAGER, MEMBER
- application_status: PENDING, REVIEWING, ACCEPTED, REJECTED

### 5.3 Key Relationships

- One user can have multiple platform roles through user_roles.
- One user has one player profile (optional until onboarding is complete).
- One organization has many members, rosters, and tryouts.
- One tryout can have many applications.
- One player can apply once per tryout (unique constraint).

### 5.4 Data Integrity and Moderation Fields

- users.is_suspended supports account suspension
- player_profiles.avatar_url stores profile image URLs
- tryouts.job_description adds richer post details
- tryouts.deleted_at and tryouts.deleted_by support admin soft delete

### 5.5 Database Security Model

- RLS is enabled on core tables.
- Policy helpers include platform-admin and org-manager checks.
- Public reads are limited to safe data (for example, active non-deleted tryouts).
- Update and insert policies require owner or manager level access where needed.

## 6. Role and Permission Structure

GameFolio uses two permission layers:

- Platform roles from user_roles
- Organization membership roles from organization_members

### 6.1 Platform Roles

- PLAYER
  - Build and edit player profile
  - Upload avatar and highlight videos
  - Browse tryouts and submit applications
  - Track own application status

- ORG_MEMBER and ORG_ADMIN
  - Access recruiter organization workspace
  - Manage rosters and review candidate profiles
  - Post and manage tryouts (subject to membership checks)

- PLATFORM_ADMIN
  - Access admin dashboard
  - Toggle tryout active status
  - Soft-delete and restore tryouts
  - Suspend or reactivate users

### 6.2 Organization Membership Roles

- OWNER: full control in organization scope
- MANAGER: management actions for roster and tryout operations
- MEMBER: operational access based on policy and page checks

Authorization is validated at three levels:

- Middleware for session gating
- Route layouts and actions for role checks
- RLS for final database enforcement

## 7. Implementation Details

### 7.1 Frontend and Routing

The app uses Next.js App Router with route groups:

- (public) for landing and public pages
- (auth) for signup and login
- (dashboard) for player experience
- (recruiter) for organization management
- (admin) for platform moderation

This keeps each flow isolated and easier to maintain.

### 7.2 Auth and Session Handling

- Supabase SSR clients manage auth with cookies.
- Proxy middleware refreshes sessions and protects private routes.
- Suspended users are signed out and redirected with a clear message.

### 7.3 Server Action Pattern

- Most form actions use a shared createSafeAction wrapper.
- The wrapper handles auth checks, Zod validation, and error shaping.
- Feature actions then focus on business rules.

Examples of implemented actions:

- Onboarding creates or updates player profile
- Apply-to-tryout inserts application with duplicate protection
- Org creation inserts organization, membership, and org role
- Admin actions moderate tryouts and user suspension

### 7.4 Data Access and Caching

- Server query utilities in lib/queries.ts use React cache().
- This reduces duplicate reads inside one request lifecycle.
- Data joins are normalized in the query layer before UI rendering.

### 7.5 Media Handling

- Supabase Storage buckets are used for:
  - Player avatars
  - Player highlights
  - Organization logos
- Uploads are handled in server actions and persisted in SQL tables.

### 7.6 UI and UX Implementation

- Tailwind and shadcn/ui build a consistent dark esports theme.
- Shared nav layouts adapt to player, recruiter, and admin contexts.
- Loading states, empty states, and toasts are used in core workflows.

### 7.7 Testing and Validation

- Action and component tests exist under frontend/__tests__.
- End-to-end flows exist under frontend/e2e.
- Covered flows include auth, player, recruiter, and admin scenarios.

## 8. Summary

GameFolio is implemented as a secure, role-based esports recruitment platform.
The codebase follows server-first Next.js patterns, Supabase RLS boundaries, and typed action-driven features.
The MVP currently supports end-to-end player, recruiter, and admin workflows with testing support.