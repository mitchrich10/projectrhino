CREATE TABLE public.portal_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  item_id uuid,
  item_name text NOT NULL,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  company_name text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert analytics"
  ON public.portal_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RhinoVC admins can read analytics"
  ON public.portal_analytics
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) ~~ '%@rhinovc.com'::text);

CREATE INDEX idx_portal_analytics_event_type ON public.portal_analytics (event_type);
CREATE INDEX idx_portal_analytics_created_at ON public.portal_analytics (created_at DESC);