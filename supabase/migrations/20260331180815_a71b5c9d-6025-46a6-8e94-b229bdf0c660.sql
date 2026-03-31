ALTER TABLE public.founder_onboarding 
ADD COLUMN IF NOT EXISTS rhino_assistance text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS feature_company boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS announcing_raise text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS priority_context jsonb DEFAULT '{}'::jsonb;