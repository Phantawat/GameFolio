# 🏗️ GameFolio: Architecture Stack & Conventions

## 1. Core Technology Stack
* **Framework:** Next.js 15+ (App Router strictly enforced)
* **Language:** TypeScript (Strict mode enabled)
* **Backend & Auth:** Supabase (PostgreSQL, GoTrue Auth, Storage)
* **Auth Integration:** `@supabase/ssr` (Cookie-based auth for Server Components)
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui (Radix UI primitives)
* **Icons:** Lucide React
* **Hosting/Deployment:** Vercel

---

## 2. Next.js App Router Structure
We use **Route Groups** (folders in parentheses) to organize the application logically without affecting the URL paths. This separates the landing page from the secure dashboards.

```text
src/
├── app/
│   ├── (public)/              # Public-facing pages (SEO optimized)
│   │   ├── page.tsx           # Landing Page
│   │   ├── tryouts/           # Public Job Board
│   │   └── players/           # Public Player Directory
│   │
│   ├── (auth)/                # Authentication flows
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/        # Creates the Player/Org profile after signup
│   │
│   ├── (dashboard)/           # Protected routes (Requires Auth)
│   │   ├── layout.tsx         # Shared dashboard sidebar/navbar
│   │   ├── player/            # Player-specific views
│   │   ├── org/               # Organization-specific views
│   │   └── admin/             # Platform admin views
│   │
│   ├── api/                   # (Optional) Webhooks or external API routes
│   │
│   ├── layout.tsx             # Root layout (Fonts, Meta tags, Global Providers)
│   └── globals.css            # Tailwind directives
│
├── components/
│   ├── ui/                    # shadcn/ui base components (buttons, inputs)
│   ├── forms/                 # Reusable form components
│   └── layout/                # Navbars, Sidebars, Footers
│
├── lib/
│   ├── supabase/              # Supabase clients (server.ts, client.ts, middleware.ts)
│   └── utils.ts               # Tailwind merge and general helpers
│
└── types/                     # Global TypeScript interfaces & Supabase generated types

```

---

## 3. Data Fetching & State Strategy

### Server Components by Default

To maximize performance and SEO, all pages (`page.tsx`) and layouts (`layout.tsx`) should be **React Server Components (RSC)**.

* Fetch data directly from Supabase within the server component.
* Pass only the required, serialized data down to Client Components as props.

### Client Components (`"use client"`)

Use the `"use client"` directive *only* at the leaves of your component tree when you need:

* Interactivity (e.g., `onClick`, `onChange`).
* React hooks (`useState`, `useEffect`).
* Form submissions (e.g., applying to a tryout).

### Authentication State

Do not rely purely on React Context or Local Storage for auth state.

* Use Supabase middleware (`src/lib/supabase/middleware.ts`) to intercept requests and verify cookies.
* If a user tries to access `/player` without a valid cookie or role, the middleware should redirect them to `/login` before the page even renders.

---

## 4. UI & Styling Conventions

* **Utility-First:** Write all styles using Tailwind CSS classes. Avoid writing custom CSS in `globals.css` unless absolutely necessary (e.g., defining base theme variables).
* **Component Library:** Use `shadcn/ui` to scaffold complex, accessible components (Select dropdowns, Dialogs, Data Tables) rapidly. This prevents spending 3 days styling a custom dropdown.
* **Responsive Design:** Build **mobile-first**. Use `md:` and `lg:` prefixes for tablet and desktop layouts.

---

## 5. Error Handling & Loading States

* **Loading:** Use `loading.tsx` files in route directories to show skeleton loaders automatically while Server Components fetch data.
* **Errors:** Use `error.tsx` files to gracefully catch server errors and provide a "Try Again" button, preventing the entire app from crashing.
* **Form Mutations:** Use toast notifications (e.g., `sonner` or shadcn's `use-toast`) to provide immediate user feedback on actions (e.g., "Application Submitted", "Profile Updated").
