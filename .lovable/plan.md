# Payment method on bookings

No real payment processor needed — Cash on Service is metadata, and JazzCash/easypaisa are placeholders.

## Database

- Add `payment_method` enum: `cash` | `jazzcash` | `easypaisa`.
- Add columns to `bookings`:
  - `payment_method payment_method NOT NULL DEFAULT 'cash'`
  - `commission_rate numeric NOT NULL DEFAULT 0.15` (snapshot at booking time so future rate changes don't rewrite history)
- Commission amount is derived in the UI: `price * commission_rate`.

## Booking form (`/book`)

- New "Payment method" section above the submit button, using a radio-style card group (shadcn `RadioGroup` or three buttons). Options:
  - **Cash on Service** — selectable, default. Subtext: "Pay the technician after the job."
  - **JazzCash** — selectable visually, shows a "Coming soon" badge and is disabled.
  - **easypaisa** — same treatment.
- Zod schema extended to accept only `cash` for now (others rejected with toast "Coming soon — please pick Cash on Service").
- Insert sets `payment_method: 'cash'`.

## Customer views

- `/my-bookings`: show payment method as a small badge in each booking card (e.g. "Cash on Service").

## Admin dashboard (`/admin`)

- In each booking card, add a small grid line:
  - Payment: `Cash on Service`
  - Service price: `PKR 1,500`
  - Commission (15%): `PKR 225`
  - Provider payout: `PKR 1,275`
- Optional: a top-of-page stats card showing total bookings revenue and total commission across all bookings.

## Components

- `PaymentMethodBadge` — maps enum → label + style.
- No new dialogs; pure presentation changes elsewhere.

## Out of scope

- Real JazzCash / easypaisa integration, refunds, partial payments, payout tracking to providers, invoices/receipts.

## Open questions (assumed defaults)

1. Commission applies to every booking regardless of payment method — yes.
2. Commission is informational only (admin sees it; customer does not) — yes.
