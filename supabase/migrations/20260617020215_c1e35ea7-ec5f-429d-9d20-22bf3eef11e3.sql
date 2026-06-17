
DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash', 'jazzcash', 'easypaisa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_method public.payment_method NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 0.15;
