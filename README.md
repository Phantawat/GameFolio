# 🎮 GameFolio: Professional Network for Esports

**GameFolio** is a full-stack, web-based professional networking platform designed specifically for competitive gamers and esports organizations. Think of it as **"LinkedIn for Gamers"**, bridging the gap between talent and recruitment by replacing fragmented communication channels with structured performance portfolios and standardized application workflows.

---

## 🚀 Key Features

### 👤 For Players
- **Professional Portfolios:** Build verifiable profiles showcasing ranks, roles, and game-specific statistics (e.g., *Valorant Radiant #124*).
- **Career History:** Highlight past team experience and achievements.
- **Application Tracking:** Apply to team tryouts and track application status in real-time.

### 🏢 For Organizations (Recruiters)
- **Talent Recruitment:** Post detailed tryouts and manage applications in a centralized dashboard.
- **Application Management:** Review candidates, update statuses (`PENDING`, `REVIEWING`, `ACCEPTED`, `REJECTED`), and streamline the hiring process.
- **Team Profiles:** Showcase organization details and active rosters.

### 🛡️ Security & Access
- **Role-Based Access Control:** Strict data isolation between **Players**, **Recruiters**, and **Admins**.
- **Secure Authentication:** Powered by Supabase Auth with Row Level Security (RLS) policies.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **Language:** TypeScript
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, GoTrue)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🔐 Auth and Authorization Model

- **Authentication:** Supabase SSR cookies refreshed in middleware.
- **Authorization:** Enforced in server-side layouts and server actions.
- **Role source of truth:** `users` + `user_roles` + membership tables (`organization_members`).
- **Player onboarding:** `player_profiles` is created after sign-up during onboarding.

---

## 📂 Project Structure

```text
frontend/
├── app/
│   ├── (auth)/             # Authentication routes (Login, Signup)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── applications/   # Application tracker
│   │   ├── player/         # Player profile management
│   │   └── ...
│   ├── api/                # API routes (Webhooks, etc.)
│   └── page.tsx            # Landing page
├── components/
│   ├── layout/             # Global layout components (Navbar, Footer)
│   ├── ui/                 # Reusable UI primitives (Buttons, Cards, Inputs)
│   └── ...
├── lib/
│   ├── supabase/           # Supabase client & server utilities
│   │   ├── middleware.ts   # Session refresh/auth gating
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- A Supabase project set up.

### 2. Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Phantawat/GameFolio.git
   cd GameFolio/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `frontend` directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3.5 Run SQL Migrations and E2E Fixtures

Apply SQL updates in order (Supabase SQL Editor or CLI) including:
- `supabase/week-10-admin-tryouts-update-rls-fix.sql`
- `supabase/week-10-player-profile-availability.sql`
- `supabase/week-11-admin-tryout-soft-delete.sql`
- `supabase/week-11-e2e-fixtures-seed.sql`

Configure E2E credentials (must match seeded values or your overridden fixtures):

```env
E2E_ADMIN_EMAIL=e2e-admin@gamefolio.test
E2E_ADMIN_PASSWORD=E2EAdminPass!123
E2E_PLAYER_EMAIL=e2e-player@gamefolio.test
E2E_PLAYER_PASSWORD=E2EPlayerPass!123
E2E_RECRUITER_EMAIL=e2e-recruiter@gamefolio.test
E2E_RECRUITER_PASSWORD=E2ERecruiterPass!123
E2E_RECRUITER_NO_ORG_EMAIL=e2e-recruiter-no-org@gamefolio.test
E2E_RECRUITER_NO_ORG_PASSWORD=E2ENoOrgPass!123
E2E_ONBOARDING_PLAYER_EMAIL=e2e-onboarding@gamefolio.test
E2E_ONBOARDING_PLAYER_PASSWORD=E2EOnboardPass!123
```

---

## 📦 Scope & Constraints (MVP)

To ensure focus and robust core functionality, the current version (MVP) has the following boundaries:
- **Manual Stats:** Game statistics are manually input by users (no direct Riot/Steam API integration yet).
- **Web-First:** Optimized for responsive web usage (no native mobile apps).
- **Communication:** No in-app real-time chat (external communication is encouraged after initial screening).
- **Monetization:** No payment gateways or subscription tiers implemented yet.

## 🧪 Testing Commands

- Unit/action/component tests: `npm run test`
- E2E tests: `npm run test:e2e`
- E2E headed UI mode: `npm run test:e2e:ui`

---

## 👥 Contributing

This project is currently under active development. Please check the `spec` folder for detailed architecture decisions and timelines.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
**License**: MIT
