## Booking status flow + WhatsApp contact

Map the requested stages onto the existing `booking_status` enum (no DB migration needed):

- Pending → `pending`
- Accepted → `confirmed`
- On the Way → `in_progress`
- Completed → `completed`
- Cancelled → `cancelled`

`assigned` and `rejected_by_provider` stay as internal sub-states (admin assignment / provider decline) but are not part of the main 4-step progress bar.

### 1. Status labels (`src/components/status-badge.tsx`)
Rename `confirmed` → "Accepted" and `in_progress` → "On the Way" so the badge matches the new vocabulary across customer, provider, and admin views.

### 2. Progress indicator (new `src/components/booking-progress.tsx`)
A mobile-friendly 4-step horizontal indicator (Pending · Accepted · On the Way · Completed). Steps before/at current status are filled with `primary`; future steps are muted. `cancelled` / `rejected_by_provider` render a single muted "Cancelled" row instead of the bar. Used on `my-bookings` (customer), `provider` dashboard, and `admin` booking card.

### 3. WhatsApp button (new `src/components/whatsapp-button.tsx`)
Small outline button with the WhatsApp glyph (lucide `MessageCircle`). Opens `https://wa.me/<digits>?text=<prefilled>` in a new tab. Phone is sanitized to digits; Pakistan numbers starting with `0` are converted to `92…`. If no phone is available the button is hidden.

Rendered on every booking card:
- Customer view (`my-bookings`): shows "Message provider" once a provider is assigned, using `providers.phone`.
- Provider view (`provider`): shows "Message customer" using `profiles.phone` of the booking's `user_id`.
- Admin view (`admin`): shows both buttons side by side when phones exist.

The customer card and provider card already load the counterpart record; the admin card needs to also select `profiles(phone, full_name)` alongside the existing provider join.

### 4. Provider dashboard (`src/routes/provider.tsx`)
Action buttons reflect the new flow:
- `pending` / `assigned` → "Accept" sets status to `confirmed`; "Reject" sets `rejected_by_provider`.
- `confirmed` → "On the way" sets status to `in_progress`.
- `in_progress` → "Mark completed" sets status to `completed`.
Add the progress indicator above the actions.

### 5. Customer bookings (`src/routes/my-bookings.tsx`)
Under each booking card show the progress indicator and the "Message provider" WhatsApp button (when a provider is assigned). Existing review flow on `completed` is unchanged.

### 6. Admin dashboard (`src/routes/admin.tsx`)
- Keep the existing status `<Select>` but reorder options to the canonical flow (Pending, Accepted, On the Way, Completed, Cancelled) plus the internal `Assigned` / `Provider declined` at the bottom.
- Add a destructive "Cancel booking" button next to the select for one-click cancellation when status ≠ `cancelled`/`completed`.
- Show the progress indicator and both WhatsApp buttons (customer + provider) on each card.
- Extend the bookings query to also fetch `profiles(full_name, phone)` for the customer.

### Out of scope
- No new enum values, no schema migration.
- No in-app chat — WhatsApp deep-link only.
- No notifications/emails on status change.
- No timestamps per status transition (only the existing `updated_at`).
