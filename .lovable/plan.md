## Final polish pass

A focused round of cosmetic, responsive, and UX polish on top of what already ships. No new features, no schema changes. The existing teal-on-cream theme stays — already clean and trustworthy.

### 1. Header / footer consistency
- **`site-header.tsx`**: nav grew to 8+ links — on tablet they wrap awkwardly. Move secondary links (`How it works`, `About`, `Contact`) into the desktop nav only at `lg:` so the row doesn't collapse at `md`. Mobile menu already handles all links cleanly.
- Add a small WhatsApp icon-button in the header (visible at `sm:` and up) using `WhatsAppButton` with the shared support number.
- **`site-footer.tsx`**: add contact line (phone + WhatsApp button) under the Company column so every page has a one-tap contact.
- A single shared `SUPPORT_CONTACT` constant in `src/lib/contact.ts` so the contact page, header, and footer use the same number.

### 2. Mobile-first review
Walk the main routes at 375px and fix anything broken. Concrete known issues to address:
- `/admin` booking card: two-column grid forces a 56px sidebar at `md:` only — on small screens, action column already stacks, but the status select + cancel button need full width and 44px tap targets.
- `/my-bookings` booking card: provider line + WhatsApp button overflow on narrow screens — wrap with `flex-wrap` and `min-w-0` per `responsive-layout-patterns`.
- `/book` form: ensure inputs are `h-11` (44px tap), buttons full-width on mobile, payment method buttons stack cleanly on `< sm:`.
- `/provider` action buttons: ensure they wrap and each has `min-h-11`.
- All `size="icon"` buttons get `aria-label` + `min-h-11 min-w-11` where they're primary tap targets (header menu toggle already OK; double-check).
- Hero `h1` already scales; verify `text-4xl md:text-6xl` doesn't overflow at 320px — switch to `text-3xl sm:text-4xl md:text-6xl`.

### 3. Homepage refresh (`/`)
- Keep current hero copy; tighten the "vetted technicians · Fixed prices" pill and add a secondary CTA "How it works" linking to `/how-it-works` next to the existing "See services" button.
- Move the `TrustBadges` row directly under the CTAs (already there — verify spacing).
- After Services section, add a **short "How it works" preview**: reuse the current 3-step block already on the homepage, plus a "See full guide →" link to `/how-it-works`. (Already present — just polish wording and add the link, which I noticed is already in place.)
- Add a final **testimonials strip** (latest 3 reviews ≥ 4 stars) above the footer, reusing the same query the About page uses. Hidden when empty.

### 4. Loading & empty states
- Replace bare `"Loading…"` text with a small `<Spinner />` component (lucide `Loader2` with `animate-spin`) in: `/my-bookings`, `/admin`, `/provider`, `/book`, `/auth`. Centered with the existing layout.
- Form submit buttons already show `"Submitting…"` text — add the spinner icon next to the text on `book.tsx`, `become-provider.tsx`, the review dialog, and the auth forms.
- Empty-state cards (no bookings, no providers) already look fine; verify each has a clear CTA.

### 5. Toast messages — friendly copy pass
Audit `toast.error(...)` / `toast.success(...)` calls and rewrite tech-y messages:
- Zod first-issue message → keep but prefix with the field name where helpful.
- `error.message` from Supabase → wrap with a friendly fallback: `toast.error("Something went wrong. Please try again.")` and log the raw error to the console.
- Success messages: ensure each meaningful action has one (booking, review, provider apply, accept/reject, assign, status change).

### 6. Spacing / typography consistency
- Standardize page section padding to `py-10 md:py-14` (some routes use `py-10`, others `py-16` — pick `py-12` as the default for inner content sections, keep `py-16/24` only for the homepage hero).
- All page `<h1>` use `text-3xl md:text-4xl font-bold tracking-tight` (currently a mix of `text-2xl` and `text-3xl`). One-line change per route.
- All cards use `rounded-2xl` consistently (some use the shadcn default).

### 7. End-to-end smoke check (no code, just verification)
After the edits, walk the flow in the preview at mobile width:
1. Sign up as a customer → book a service (Cash) → toast "Booking confirmed!" → `/my-bookings` shows Pending with progress bar.
2. Sign in as admin → see booking in `/admin` → assign to an approved+available provider → status flips to Assigned.
3. Sign in as that provider → `/provider` → Accept → On the way → Mark completed.
4. Back as customer → `/my-bookings` shows Completed → leave a 5-star review → toast "Thanks for your review!".
Capture any breakage and fix it before declaring done. No schema or query changes are expected.

### Out of scope
- No color theme change, no font swap, no new design directions.
- No new features (notifications, chat, payment integrations, etc.).
- No new tables, RLS edits, or migrations.
- No copy-rewrite of legal pages.
