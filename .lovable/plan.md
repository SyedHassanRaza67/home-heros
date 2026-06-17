## Trust & info pages + trust badges

### New routes (each with own `head()` meta — title, description, og:title, og:description)
1. **`src/routes/how-it-works.tsx`** — three big numbered steps with icons:
   - Book a service (calendar icon)
   - A verified professional is assigned (shield/badge icon)
   - Job done — you pay and rate (check icon)
   CTA at bottom: "Book a service" → `/book`.

2. **`src/routes/about.tsx`** ("Why trust us") — four pillar cards:
   - Verified professionals (CNIC + photo checked)
   - Upfront fixed pricing, no hidden charges
   - Satisfaction guarantee
   - Real customer reviews
   Plus a short live-reviews strip: pulls latest 3 reviews with rating ≥ 4 via `supabase.from("reviews").select("rating, comment, created_at, providers(full_name)").gte("rating",4).order("created_at",{ascending:false}).limit(3)`. Hidden if none yet.

3. **`src/routes/contact.tsx`** — three contact cards: phone (`tel:` link), email (`mailto:` link), WhatsApp (reuses existing `<WhatsAppButton>`). Single hardcoded company contact constants at top of file (placeholders the user can edit): phone `+92 300 0000000`, email `hello@homefix.pk`, WhatsApp same number. Note clearly marked as "Update these in `src/routes/contact.tsx`" via a code comment.

4. **`src/routes/terms.tsx`** — Terms of Service. Standard sections (Acceptance, Service description, Bookings & payments, Cancellations, Provider conduct, Liability disclaimer, Changes, Governing law — Pakistan). Generic template suitable for app-store submission; static prose, no dynamic data.

5. **`src/routes/privacy.tsx`** — Privacy Policy. Standard sections (Data we collect, How we use it, Sharing with providers, Storage & security, User rights, Cookies, Children, Contact). Generic template; static prose.

### New shared component
**`src/components/trust-badges.tsx`** — small responsive row of pill badges with icons (ShieldCheck / BadgeCheck / Sparkles): "Verified Professionals", "Upfront Pricing", "Satisfaction Guarantee". Accepts `variant: "compact" | "full"` and `className`. Each badge links to the relevant page (`/about`).

### Integrations
- **`src/routes/index.tsx`**:
  - Replace the existing inline 3-feature row under the hero with the new `<TrustBadges variant="full" />`.
  - Add a "Learn more" link under the "How it works" section pointing to `/how-it-works`.
- **`src/routes/book.tsx`** (service/booking page): add `<TrustBadges variant="compact" />` directly above the booking form so customers see the trust signals at the point of decision.
- **`src/components/site-header.tsx`**: add nav links for `How it works`, `About`, `Contact` (kept inline on desktop; existing mobile menu pattern if present).
- **`src/components/site-footer.tsx`**: expand to a simple 3-column footer — Company (About, How it works, Contact), Legal (Terms, Privacy), and the existing copyright line. Still single-file, no new deps.

### Out of scope
- No contact form (the page links to phone/email/WhatsApp only — matches the request).
- No CMS for the legal pages; static prose lives in the route files.
- No new database tables; About page reuses existing `reviews` data.
- No real legal review — pages are clearly generic templates the user can have a lawyer review later.
