
-- Add domain column to onboarding_progress for company-level tracking
ALTER TABLE public.onboarding_progress 
  ADD COLUMN IF NOT EXISTS domain text;

-- Backfill existing rows with a placeholder (won't matter, they'll be unused)
UPDATE public.onboarding_progress SET domain = 'unknown' WHERE domain IS NULL;

-- Make domain NOT NULL going forward
ALTER TABLE public.onboarding_progress 
  ALTER COLUMN domain SET NOT NULL;

-- Drop the old unique constraint if any, add new one per (domain, step_id)
-- (no prior unique constraint was added, but be safe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_progress_user_id_step_id_key'
  ) THEN
    ALTER TABLE public.onboarding_progress DROP CONSTRAINT onboarding_progress_user_id_step_id_key;
  END IF;
END $$;

-- Add unique constraint per company domain + step
ALTER TABLE public.onboarding_progress 
  DROP CONSTRAINT IF EXISTS onboarding_progress_domain_step_id_key;

ALTER TABLE public.onboarding_progress 
  ADD CONSTRAINT onboarding_progress_domain_step_id_key UNIQUE (domain, step_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can read own progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON public.onboarding_progress;

-- New RLS: users can read/insert/delete progress for their own domain
CREATE POLICY "Users can read company progress"
  ON public.onboarding_progress FOR SELECT
  USING (
    domain = split_part(auth.jwt() ->> 'email', '@', 2)
    OR (auth.jwt() ->> 'email') LIKE '%@rhinovc.com'
  );

CREATE POLICY "Users can insert company progress"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (
    domain = split_part(auth.jwt() ->> 'email', '@', 2)
  );

CREATE POLICY "Users can delete company progress"
  ON public.onboarding_progress FOR DELETE
  USING (
    domain = split_part(auth.jwt() ->> 'email', '@', 2)
  );
