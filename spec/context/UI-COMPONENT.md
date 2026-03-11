# 🎨 GameFolio: UI System & Component Guidelines

## 1. Theming & Color Palette
GameFolio uses a **dark-mode only** design with a warm near-black base and a bold orange accent to align with competitive esports culture while maintaining a clean, professional structure.

> The entire app has `className="dark"` on the `<html>` tag. All shadcn/ui CSS variables resolve from the `.dark` selector.

### Core Colors (always use these exact values)
| Role | Value | Usage |
|---|---|---|
| Page Background | `bg-[#0F0A09]` | Root layout, page fills |
| Card / Surface | `bg-[#140C0B]` | All `<Card>` components, list items |
| Primary Accent | `#FF5C00` / `bg-[#FF5C00]` | Buttons, active nav, progress bars, icons |
| Accent Hover | `hover:bg-orange-600` | Primary button hover state |
| Accent Muted | `bg-[#FF5C00]/10` + `text-[#FF5C00]` | Badges, tag pills, subtle highlights |

### Borders
* Standard: `border-zinc-800`
* Hover: `hover:border-zinc-700` or `hover:border-zinc-600`
* Accent outline: `border-[#FF5C00]/20`

### Typography
| Role | Class |
|---|---|
| Primary text | `text-white` or `text-zinc-50` |
| Body / secondary | `text-zinc-400` |
| Muted / metadata | `text-zinc-500` |
| Accent label | `text-[#FF5C00]` |
| Uppercase label | `text-zinc-300 font-semibold uppercase text-xs tracking-wider` |

### Status Colors
* **Success / Accepted:** `bg-green-500/20 text-green-500 border-green-500/20`
* **Pending / Under Review:** `bg-amber-500/20 text-amber-500 border-amber-500/20`
* **Rejected / Declined:** `bg-zinc-500/20 text-zinc-500 border-zinc-500/20`
* **Error:** `text-red-400` / `bg-red-500/10`
* **Active / Live badge:** `bg-[#FF5C00]/10 text-[#FF5C00] border-[#FF5C00]/20` with a pulsing dot

---

## 2. Typography & Icons
* **Font Family:** `Geist Sans` (loaded via `next/font/google` in `layout.tsx`). Monospace (`Geist Mono`) for stats like MMR, win rate, and numeric values to ensure alignment.
* **Headings:** `font-black` or `font-extrabold` with `tracking-tight` for page titles. Section titles use `font-bold uppercase tracking-wide text-sm`.
* **Icons:** **Lucide React** exclusively. Do not mix icon libraries.
  * Standard sizes: `w-4 h-4` (inline), `w-5 h-5` (buttons/nav), `w-6 h-6` (feature icons)
  * Default color: `text-zinc-400` or `text-zinc-500`
  * Accent icon: `text-[#FF5C00]`

---

## 3. Tailwind CSS Rules
* **Mobile-First:** Always build the mobile layout first, then add `md:` / `lg:` breakpoints.
  * *Example:* `grid grid-cols-1 md:grid-cols-3`
* **No `p-*` + `pt-*` on the same element** — shorthand `p-*` resets all sides and overrides directional padding. Use `px-*` + `py-*` or `pt-*` + `pb-*` + `px-*` separately.
* **Arbitrary values** are allowed for brand colours (`bg-[#0F0A09]`, `text-[#FF5C00]`) but not for spacing. Use Tailwind's scale for spacing.
* **`cn()` utility** from `@/lib/utils` for merging conditional Tailwind classes.
* **Dashboard layout spacing:** Navbar is `h-16` fixed. Main content uses `pt-24` (via `dashboard/layout.tsx`) to clear it — do not add extra top padding inside page components.

---

## 4. shadcn/ui Component Strategy
Install primitives with `shadcn/ui` and style them to match the GameFolio dark theme.

* **Cards:** `bg-[#140C0B] border-zinc-800` on every `<Card>`. Use `hover:border-zinc-700 transition-all` for interactive cards.
* **Inputs / Selects:** `bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600` with `focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50`.
* **Primary Button:** `bg-[#FF5C00] hover:bg-orange-600 text-white font-bold`.
* **Ghost / Secondary Button:** `text-zinc-400 hover:text-white hover:bg-zinc-800`.
* **Forms & Validation:** `<Form />` + `React Hook Form` + `Zod`. Server actions use `useActionState` (React 19) instead of `useFormState`.
* **Modals/Drawers:** `<Dialog />` for desktop, `<Sheet />` for mobile slide-outs.
* **Feedback:** `<Toaster />` (Sonner) for all success/error toasts. Never use `alert()`.
* **Badges:** `<Badge variant="outline">` with custom status colour classes from the Status Colors table above.

---

## 5. Custom Reusable Components to Build
These are GameFolio-specific components to build once and reuse:

1. **`<RankBadge />`** — Takes a `rank` string (e.g., "Radiant", "Immortal 1") and renders a pill with an appropriate colour. Orange for top ranks, amber for mid, zinc for unranked.
2. **`<GameIcon />`** — Takes a `game_id` and renders the standardized game logo or a fallback initial block (`bg-zinc-800 text-zinc-400`).
3. **`<TryoutCard />`** — Standard recruitment listing card. Top orange accent bar, org avatar, game/role badges, requirements text, `<ApplyButton />` footer.
4. **`<ExperienceTimeline />`** — Vertical timeline with orange dot (current) / zinc dot (past), role in orange, date range in zinc-500.
5. **`<StatRow />`** — Reusable `<Separator />`-divided row with a zinc-500 label and white value for stat displays (MMR, win rate, hours).

---

## 6. Accessibility (a11y) & UX
* **Focus rings:** `focus-visible:ring-2 focus-visible:ring-[#FF5C00]/50` — orange to match the brand accent.
* **Loading states on mutations:** Always `disabled` + spinner (`<Loader2 className="animate-spin" />`) inside buttons during server action pending state.
* **Skeleton loading:** Use `<Skeleton className="bg-zinc-800" />` to mimic layout while data loads from Supabase.
* **Empty states:** Every list/table must have an empty state with an icon, a heading, a description, and a CTA button. See `ApplicationsList` for reference.
* **Page entry animation:** All top-level page `<div>` wrappers use `animate-in fade-in slide-in-from-bottom-4 duration-500` for a consistent page transition feel.
