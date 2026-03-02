
-- ── Onboarding Steps ──────────────────────────────────────────────────────────
CREATE TABLE public.onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text,
  resource_url text,
  "order" integer NOT NULL DEFAULT 0
);

ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read onboarding steps"
ON public.onboarding_steps FOR SELECT TO authenticated USING (true);

CREATE POLICY "RhinoVC admins can manage onboarding steps"
ON public.onboarding_steps FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com')
WITH CHECK ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- ── Onboarding Progress ───────────────────────────────────────────────────────
CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  step_id uuid NOT NULL REFERENCES public.onboarding_steps(id) ON DELETE CASCADE,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_id)
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
ON public.onboarding_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

CREATE POLICY "Users can insert own progress"
ON public.onboarding_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
ON public.onboarding_progress FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ── Onboarding Invites ────────────────────────────────────────────────────────
CREATE TABLE public.onboarding_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,
  invited_by text NOT NULL,
  note text
);

ALTER TABLE public.onboarding_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RhinoVC admins can manage invites"
ON public.onboarding_invites FOR ALL TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com')
WITH CHECK ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

CREATE POLICY "System can read invites"
ON public.onboarding_invites FOR SELECT TO authenticated USING (true);

-- ── Notification Subscriptions ────────────────────────────────────────────────
CREATE TABLE public.notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  subscribed boolean NOT NULL DEFAULT true
);

ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscription"
ON public.notification_subscriptions FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RhinoVC admins can read all subscriptions"
ON public.notification_subscriptions FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- ── Updated_at triggers ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_onboarding_steps_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_onboarding_steps_updated_at
BEFORE UPDATE ON public.onboarding_steps
FOR EACH ROW EXECUTE FUNCTION public.update_onboarding_steps_updated_at();
