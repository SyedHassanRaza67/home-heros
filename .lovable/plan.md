# Add Provider Role, Assignments & Ratings

## Database changes

- Extend `app_role` enum: add `provider`.
- New table `providers`:
  - `id` (uuid, pk), `user_id` (uuid, fk auth.users, unique)
  - `full_name`, `phone`, `cnic`, `service_slug`, `city` (text)
  - `photo_url` (text, public-readable)
  - `status` enum `provider_status`: `pending` | `approved` | `rejected` (default `pending`)
  - `is_available` (bool, default false)
  - `created_at`
- New table `reviews`:
  - `id`, `booking_id` (unique fk bookings), `provider_id` (fk providers), `customer_id` (fk auth.users)
  - `rating` (int 1–5, check), `comment` (text), `created_at`
- Extend `bookings`:
  - `provider_id` (uuid, nullable, fk providers)
  - add `assigned` and `rejected_by_provider` to `booking_status` enum
- Storage bucket `provider-photos` (public read) for CNIC/profile photos. RLS: providers upload to their own `user_id/*` folder; admins read all.
- RLS policies:
  - `providers`: provider reads/updates own row (limited fields: `is_available`); admin reads/updates all; insert allowed for any authenticated user (self-registration with `user_id = auth.uid()`).
  - `reviews`: customer inserts own (must own the related booking, booking status=completed); everyone authenticated can read; provider can read own.
  - `bookings`: provider can SELECT and UPDATE (status only) bookings where `provider_id = (select id from providers where user_id=auth.uid())`. Admin can UPDATE `provider_id`.
- View / RPC `provider_ratings(provider_id, avg_rating, review_count)` or compute client-side from reviews.
- Trigger on new signup: still defaults to `customer` role. Provider role is granted by admin on approval (or auto-granted when provider registration row is inserted — see Open Questions).

## Routes / pages

- `/auth` — add a third tab "Provider" (sign in). Sign-up for providers happens at `/become-provider`.
- `/become-provider` (public, but requires being signed in; redirects to `/auth` otherwise) — registration form: name, phone, service (select from `services`), city (Islamabad/Rawalpindi/area free text), CNIC, photo upload. On submit: insert into `providers` with `status='pending'`, upload photo to storage. Show "Pending approval" state if already submitted.
- `/_authenticated/provider` — provider dashboard:
  - Header card: profile + status badge (Pending/Approved/Rejected) + availability toggle (disabled until approved).
  - Bookings list: only `provider_id = me`. Actions per row depending on status:
    - `assigned` → Accept (→ `confirmed`) / Reject (→ `rejected_by_provider`, clears `provider_id`)
    - `confirmed` / `in_progress` → Mark Completed
  - Read-only view of customer name, phone, address, date/time, service, price.
- `/_authenticated/admin` — extend:
  - New "Providers" tab/section: table of all providers with photo thumbnail, details, status; Approve/Reject buttons (Approve also inserts `provider` role into `user_roles`).
  - In bookings table: add "Assign" dropdown listing approved + available providers matching the booking's `service_slug`; updates `bookings.provider_id` and sets status to `assigned`.
- `/_authenticated/my-bookings` — for completed bookings without a review yet, show "Leave a review" dialog (1–5 stars + short comment). Show submitted rating once left. Display provider name + avg rating on each booking row when assigned.
- Homepage / service cards: optional small "Top-rated providers" mention — out of scope unless asked.

## Components

- `StarRating` (display + input variants).
- `ProviderCard` (used in admin list and assign dropdown — shows avg rating).
- `AvailabilityToggle`.
- `ReviewDialog`.
- Update `StatusBadge` to handle new statuses (`assigned`, `rejected_by_provider`).

## Server functions (createServerFn)

- `registerProvider` (auth required): validates input with zod, inserts providers row.
- `setAvailability` (auth + must be approved provider).
- `providerRespondToBooking` (accept/reject) — checks ownership.
- `markBookingCompleted` — provider-only.
- `adminListProviders`, `adminSetProviderStatus` (also grants/revokes `provider` role on approve/reject), `adminAssignBooking`.
- `submitReview` (customer-only; requires booking owned, completed, no prior review).
- `getProviderRating(providerId)` — returns avg + count (reuse via join in listing queries).

All admin/provider-mutating fns use `requireSupabaseAuth` and `has_role` checks.

## Auth UX

- "Provider" tab in `/auth` is just sign-in (email/password). Sign-up there links to `/become-provider`. After sign-up as a normal user, they fill the provider registration; admin approval flips role.
- After login, redirect logic:
  - admin → `/admin`
  - provider (approved) → `/provider`
  - provider (pending/rejected) → `/become-provider` (status view)
  - customer → `/`

## Design

- Keep current teal/cream theme, shadcn components (Card, Table, Tabs, Dialog, Switch, Select, Badge).
- Mobile-first: provider dashboard uses stacked cards on small screens, table on md+.
- Star rating uses Lucide `Star` filled/outline; tap targets ≥ 32px.

## Out of scope

- Real-time notifications, SMS, payments, provider earnings, scheduling conflicts, multiple services per provider, photo moderation/OCR of CNIC.

## Open questions

1. CNIC photo — one photo of the CNIC, or a separate profile photo + CNIC photo? (Plan currently: single `photo_url`. Recommend splitting into `profile_photo_url` + `cnic_photo_url`.)
2. On admin approval, auto-grant `provider` role and remove `customer` role, or keep both? (Plan: add `provider`, keep `customer` so they can still book.)
3. Should the customer see the provider's name/phone before the provider accepts, or only after? (Plan: only after acceptance.)
