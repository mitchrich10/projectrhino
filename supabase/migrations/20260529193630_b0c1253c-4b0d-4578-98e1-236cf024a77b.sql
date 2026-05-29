ALTER TABLE public.onboarding_invites
  ADD COLUMN IF NOT EXISTS invitee_name text,
  ADD COLUMN IF NOT EXISTS invite_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS token_redeemed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS onboarding_invites_invite_token_idx
  ON public.onboarding_invites (invite_token);