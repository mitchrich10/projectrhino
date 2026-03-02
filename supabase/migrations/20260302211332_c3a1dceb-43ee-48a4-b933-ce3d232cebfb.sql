
-- Drop policies that depend on the domain column first
DROP POLICY IF EXISTS "Users can read company progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can insert company progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can delete company progress" ON public.onboarding_progress;

-- Drop domain column and its unique constraint
ALTER TABLE public.onboarding_progress
  DROP CONSTRAINT IF EXISTS onboarding_progress_domain_step_id_key;

ALTER TABLE public.onboarding_progress
  DROP COLUMN IF EXISTS domain;

-- Add batch_id to onboarding_progress
ALTER TABLE public.onboarding_progress
  ADD COLUMN IF NOT EXISTS batch_id uuid;

-- Unique: one completion per (batch_id, step_id)
ALTER TABLE public.onboarding_progress
  DROP CONSTRAINT IF EXISTS onboarding_progress_batch_step_key;

ALTER TABLE public.onboarding_progress
  ADD CONSTRAINT onboarding_progress_batch_step_key UNIQUE (batch_id, step_id);

-- Add batch_id to onboarding_invites
ALTER TABLE public.onboarding_invites
  ADD COLUMN IF NOT EXISTS batch_id uuid NOT NULL DEFAULT gen_random_uuid();

-- New RLS policies
CREATE POLICY "Users can read batch progress"
  ON public.onboarding_progress FOR SELECT
  USING (
    batch_id IN (
      SELECT oi.batch_id FROM public.onboarding_invites oi
      WHERE oi.email = lower(auth.jwt() ->> 'email')
    )
    OR (auth.jwt() ->> 'email') LIKE '%@rhinovc.com'
  );

CREATE POLICY "Users can insert batch progress"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (
    batch_id IN (
      SELECT oi.batch_id FROM public.onboarding_invites oi
      WHERE oi.email = lower(auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Users can delete batch progress"
  ON public.onboarding_progress FOR DELETE
  USING (
    batch_id IN (
      SELECT oi.batch_id FROM public.onboarding_invites oi
      WHERE oi.email = lower(auth.jwt() ->> 'email')
    )
  );
