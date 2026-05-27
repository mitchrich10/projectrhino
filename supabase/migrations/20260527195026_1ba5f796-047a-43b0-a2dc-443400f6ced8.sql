-- Item 5: assigned Rhino contacts per onboarding invite
ALTER TABLE public.onboarding_invites
  ADD COLUMN IF NOT EXISTS assigned_rhino_contacts text[] NOT NULL DEFAULT ARRAY['candace@rhinovc.com'];

-- Backfill existing rows (covered by default, but make explicit)
UPDATE public.onboarding_invites
  SET assigned_rhino_contacts = ARRAY['candace@rhinovc.com']
  WHERE assigned_rhino_contacts IS NULL OR array_length(assigned_rhino_contacts, 1) IS NULL;

-- Item 6: partnership PDF path
ALTER TABLE public.partnerships
  ADD COLUMN IF NOT EXISTS partnership_pdf_path text;
