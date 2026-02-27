# 🎨 GameFolio: UI System & Component Guidelines

## 1. Theming & Color Palette
GameFolio uses a strictly **dark-mode first** design to align with gaming culture while maintaining a clean, professional "LinkedIn" structure.

* **Backgrounds:** Deep slate/zinc. 
    * App Background: `bg-zinc-950`
    * Card/Surface Background: `bg-zinc-900`
* **Borders:** Subtle separation.
    * Standard Border: `border-zinc-800`
    * Hover Border: `border-zinc-700`
* **Typography (Text):** High contrast for readability.
    * Primary Text: `text-zinc-50`
    * Muted/Secondary Text: `text-zinc-400`
* **Accents (The "Esports" Vibe):** Electric Blue.
    * Primary Buttons/Links: `bg-blue-600 hover:bg-blue-700 text-white`
    * Active Nav States: `text-blue-500`
* **Status Colors:**
    * Success/Active: `text-emerald-500` / `bg-emerald-500/10`
    * Destructive/Error: `text-red-500` / `bg-red-500/10`
    * Warning/Pending: `text-amber-500` / `bg-amber-500/10`

---

## 2. Typography & Icons
* **Font Family:** `Inter` or `Geist` (sans-serif) for clean, modern readability. Monospace fonts (`font-mono`) can be used strictly for stats (e.g., MMR numbers, win rates) to ensure alignment.
* **Icons:** **Lucide React**. Do not mix and match icon libraries. Use a standard size (e.g., `w-4 h-4` or `w-5 h-5`) and color them using Tailwind text classes (e.g., `text-zinc-400`).

---

## 3. Tailwind CSS Rules
* **Mobile-First Construction:** ALWAYS build the mobile layout first. Add breakpoints (`md:`, `lg:`) only to adjust the layout for larger screens. 
    * *Example:* `flex flex-col md:flex-row` (Stacks on mobile, side-by-side on desktop).
* **Utility Class Management:** Use the `cn()` utility (provided by shadcn/ui) to merge Tailwind classes cleanly, especially when passing standard `className` props to custom components.
* **Spacing Consistency:** Stick to Tailwind's default spacing scale. Use `gap-4` or `gap-6` for grid/flex spacing, and `p-4` or `p-6` for card padding. Avoid arbitrary values like `p-[17px]`.

---

## 4. shadcn/ui Component Strategy
Do not build complex interactive components from scratch. Use `shadcn/ui` to install standard primitives and style them to match the GameFolio theme.

* **Forms & Validation:** Use `<Form />` combined with `React Hook Form` and `Zod` for schema validation. This ensures clean error handling for things like tryout postings or profile edits.
* **Cards:** Use `<Card />`, `<CardHeader />`, `<CardTitle />`, and `<CardContent />` for player stats, tryout listings, and dashboard widgets.
* **Modals/Drawers:** Use `<Dialog />` for desktop modals (e.g., confirming an application submission) and `<Sheet />` for mobile slide-out menus.
* **Feedback:** Use `<Toaster />` (Sonner) for all success/error feedback (e.g., "Application submitted successfully" or "Error updating profile").

---

## 5. Custom Reusable Components to Build
These are GameFolio-specific components you should build once and reuse across the app:

1.  **`<RankBadge />`**: Takes a `rank` string (e.g., "Radiant", "Faceit Level 10") and outputs a standardized pill with the appropriate color mapping.
2.  **`<GameIcon />`**: Takes a `game_id` and outputs the standardized logo or icon for that game.
3.  **`<TryoutCard />`**: The standard job board listing component used on both the public search page and the recruiter dashboard.
4.  **`<ExperienceTimeline />`**: A vertical timeline component to display a player's previous roster history cleanly.

---

## 6. Accessibility (a11y) & UX
* **Focus States:** Ensure all buttons and inputs have clear focus rings (`focus-visible:ring-2 focus-visible:ring-blue-500`) for keyboard navigation.
* **Loading States:** Never leave a user wondering if a button click worked.
    * Use `disabled` and show a spinner inside buttons during mutations (e.g., saving a profile).
    * Use `<Skeleton />` components to mimic the layout while data is fetching from Supabase.