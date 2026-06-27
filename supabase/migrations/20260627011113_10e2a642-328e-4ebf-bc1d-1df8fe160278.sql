DROP POLICY IF EXISTS "System can read invites" ON public.onboarding_invites;

CREATE POLICY "Users can view their own invite"
ON public.onboarding_invites
FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.jwt() ->> 'email'));