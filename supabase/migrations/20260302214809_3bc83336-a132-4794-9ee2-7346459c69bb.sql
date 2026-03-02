
ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS logo_permission boolean NULL,
  ADD COLUMN IF NOT EXISTS announcing_raise boolean NULL,
  ADD COLUMN IF NOT EXISTS wants_rhino_support boolean NULL;
