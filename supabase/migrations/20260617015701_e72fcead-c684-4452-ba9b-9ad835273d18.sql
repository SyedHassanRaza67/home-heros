
-- Extend enums
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'provider';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'assigned';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'rejected_by_provider';

-- Provider status enum
DO $$ BEGIN
  CREATE TYPE public.provider_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Providers table
CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  cnic text NOT NULL,
  service_slug text NOT NULL,
  city text NOT NULL,
  photo_url text,
  status public.provider_status NOT NULL DEFAULT 'pending',
  is_available boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.providers TO authenticated;
GRANT SELECT ON public.providers TO anon;
GRANT ALL ON public.providers TO service_role;

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved providers are public"
  ON public.providers FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Provider can view own row"
  ON public.providers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all providers"
  ON public.providers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users register as provider"
  ON public.providers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Provider updates own row"
  ON public.providers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = (SELECT status FROM public.providers WHERE id = providers.id));

CREATE POLICY "Admins update all providers"
  ON public.providers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add provider_id to bookings
ALTER TABLE public.bookings ADD COLUMN provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL;

-- New bookings policies for providers
CREATE POLICY "Provider views assigned bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "Provider updates assigned bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()))
  WITH CHECK (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Customer leaves review on own completed booking"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.user_id = auth.uid()
        AND b.status = 'completed'
        AND b.provider_id = reviews.provider_id
    )
  );

-- Storage policies for provider-photos bucket (bucket created separately)
CREATE POLICY "Provider photos are public read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'provider-photos');

CREATE POLICY "Authenticated users upload own provider photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own provider photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'provider-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
