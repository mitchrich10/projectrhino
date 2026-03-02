
CREATE TABLE public.partnerships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  tagline text,
  description text,
  logo_key text,
  logo_url text,
  redemption_url text,
  promo_code text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read partnerships"
  ON public.partnerships FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "RhinoVC admins can insert partnerships"
  ON public.partnerships FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can update partnerships"
  ON public.partnerships FOR UPDATE
  TO authenticated USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can delete partnerships"
  ON public.partnerships FOR DELETE
  TO authenticated USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

CREATE OR REPLACE FUNCTION public.update_partnerships_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_partnerships_updated_at();
