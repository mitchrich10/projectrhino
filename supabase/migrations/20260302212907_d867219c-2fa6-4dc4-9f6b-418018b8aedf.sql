
-- Create onboarding_submissions table
CREATE TABLE public.onboarding_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  company_name text NOT NULL,
  logo_path text NULL,
  team_members jsonb NOT NULL DEFAULT '[]'::jsonb,
  needs text[] NOT NULL DEFAULT '{}',
  needs_other text NULL,
  additional_notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own submission
CREATE POLICY "Users can insert own submission"
  ON public.onboarding_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own submission
CREATE POLICY "Users can read own submission"
  ON public.onboarding_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- RhinoVC admins can read all submissions
CREATE POLICY "Admins can read all submissions"
  ON public.onboarding_submissions FOR SELECT
  USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- RhinoVC admins can update any submission
CREATE POLICY "Admins can update submissions"
  ON public.onboarding_submissions FOR UPDATE
  USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_onboarding_submissions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_onboarding_submissions_updated_at
  BEFORE UPDATE ON public.onboarding_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_submissions_updated_at();

-- Storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS for company logos bucket
CREATE POLICY "Anyone can read logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');
