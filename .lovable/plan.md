# Home Services Booking Site

A clean, mobile-friendly booking site for Islamabad & Rawalpindi with Electrician and AC Repair services, customer/admin auth, and an admin dashboard.

## Pages

- `/` — Homepage: hero "Book trusted home services in Islamabad & Rawalpindi", service cards (Electrician, AC Repair) with fixed prices, trust badges, CTA to book
- `/book` — Booking form (service preselect via query param, date, time, address, phone). Requires login; redirects to `/auth` if not signed in
- `/auth` — Combined sign in / sign up (email + password). Toggle between Customer and Admin login tabs (same auth, role determines redirect)
- `/_authenticated/my-bookings` — Customer's own bookings
- `/_authenticated/admin` — Admin-only dashboard listing ALL bookings with customer details and status dropdown (pending / confirmed / in_progress / completed / cancelled). Non-admins redirected.

## Backend (Lovable Cloud)

Tables:
- `services` (id, slug, name, price, description, icon) — seeded with Electrician (PKR 1500) and AC Repair (PKR 2500). *I'll use these defaults unless you tell me otherwise.*
- `bookings` (id, user_id, service_slug, service_name, price, booking_date, booking_time, address, phone, status, notes, created_at)
- `user_roles` (id, user_id, role enum: admin | customer) — separate roles table per security best practice
- `profiles` (id → auth.users, full_name, phone) — auto-created on signup via trigger

Security:
- RLS enabled on all tables
- `has_role(uuid, app_role)` security-definer function
- Customers: insert own bookings, select own bookings
- Admins: select/update all bookings
- Services: public read
- New signups get `customer` role automatically. First admin is promoted manually via SQL (I'll provide the snippet).

## Design

- Friendly, trustworthy palette: warm teal primary, soft cream background, rounded cards, generous spacing
- Mobile-first responsive layout
- shadcn components (Button, Card, Input, Select, Calendar, Table, Badge, Tabs)
- Sticky header with logo + nav

## Technical notes

- Booking submit uses authenticated server fn (`requireSupabaseAuth`)
- Admin dashboard reads via authenticated server fn that checks `has_role(uid, 'admin')`
- Status updates via server fn with admin role check
- Phone validated with zod (PK format flexible)

## Out of scope (can add later)

- Payments / online checkout
- SMS/email notifications
- Service-provider accounts
- Reviews/ratings
