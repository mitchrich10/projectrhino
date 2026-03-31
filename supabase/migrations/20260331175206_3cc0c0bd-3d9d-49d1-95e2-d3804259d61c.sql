
-- Founder onboarding data (one record per batch)
CREATE TABLE public.founder_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL UNIQUE,
  logo_path text,
  primary_color text DEFAULT '#173660',
  secondary_color text DEFAULT '#1A7EC8',
  brand_guidelines_path text,
  tagline text,
  additional_contacts jsonb DEFAULT '[]'::jsonb,
  tech_stack jsonb DEFAULT '{}'::jsonb,
  priorities text[] DEFAULT '{}'::text[],
  priorities_other text,
  priorities_notes text,
  completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Batch members can read" ON public.founder_onboarding
  FOR SELECT TO authenticated
  USING (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
    OR (auth.jwt()->>'email') LIKE '%@rhinovc.com'
  );

CREATE POLICY "Batch members can insert" ON public.founder_onboarding
  FOR INSERT TO authenticated
  WITH CHECK (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
  );

CREATE POLICY "Batch members can update" ON public.founder_onboarding
  FOR UPDATE TO authenticated
  USING (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
    OR (auth.jwt()->>'email') LIKE '%@rhinovc.com'
  );

-- Step completions tracking (who completed which step)
CREATE TABLE public.founder_onboarding_step_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text,
  step_number integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(batch_id, step_number, user_id)
);

ALTER TABLE public.founder_onboarding_step_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Batch members can read completions" ON public.founder_onboarding_step_completions
  FOR SELECT TO authenticated
  USING (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
    OR (auth.jwt()->>'email') LIKE '%@rhinovc.com'
  );

CREATE POLICY "Batch members can insert completions" ON public.founder_onboarding_step_completions
  FOR INSERT TO authenticated
  WITH CHECK (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
    AND auth.uid() = user_id
  );

CREATE POLICY "Batch members can delete completions" ON public.founder_onboarding_step_completions
  FOR DELETE TO authenticated
  USING (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
    AND auth.uid() = user_id
  );

-- Share tokens for team members
CREATE TABLE public.founder_onboarding_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  target_step integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_onboarding_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Batch members can manage shares" ON public.founder_onboarding_shares
  FOR ALL TO authenticated
  USING (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
  )
  WITH CHECK (
    batch_id IN (SELECT oi.batch_id FROM public.onboarding_invites oi WHERE oi.email = lower(auth.jwt()->>'email'))
  );

-- Public read policy for token lookup (needed by edge function)
CREATE POLICY "Anyone can read shares by token" ON public.founder_onboarding_shares
  FOR SELECT TO anon, authenticated
  USING (true);

-- Update trigger for founder_onboarding
CREATE OR REPLACE FUNCTION public.update_founder_onboarding_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_founder_onboarding_updated_at
  BEFORE UPDATE ON public.founder_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.update_founder_onboarding_updated_at();

-- Storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true);

CREATE POLICY "Authenticated users can upload brand assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-assets');

CREATE POLICY "Anyone can read brand assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'brand-assets');
