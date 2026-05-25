-- 1) Add logo_path column to partnerships
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS logo_path text;

-- 2) Create partnership-logos public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('partnership-logos', 'partnership-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Storage policies for partnership-logos
DROP POLICY IF EXISTS "Public can view partnership logos" ON storage.objects;
CREATE POLICY "Public can view partnership logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'partnership-logos');

DROP POLICY IF EXISTS "RhinoVC admins can upload partnership logos" ON storage.objects;
CREATE POLICY "RhinoVC admins can upload partnership logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'partnership-logos' AND (auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

DROP POLICY IF EXISTS "RhinoVC admins can update partnership logos" ON storage.objects;
CREATE POLICY "RhinoVC admins can update partnership logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'partnership-logos' AND (auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

DROP POLICY IF EXISTS "RhinoVC admins can delete partnership logos" ON storage.objects;
CREATE POLICY "RhinoVC admins can delete partnership logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'partnership-logos' AND (auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- 4) Extend allowed item_type values to include 'fundraising'
CREATE OR REPLACE FUNCTION public.validate_partner_request_item_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  allowed text[] := ARRAY['resource','partnership','event','intro','other','financing_guide','access_request','fundraising'];
  v text;
BEGIN
  IF NEW.item_type IS NULL OR array_length(NEW.item_type, 1) IS NULL THEN
    RAISE EXCEPTION 'item_type must contain at least one value';
  END IF;
  FOREACH v IN ARRAY NEW.item_type LOOP
    IF NOT (v = ANY(allowed)) THEN
      RAISE EXCEPTION 'invalid item_type value: %', v;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$function$;

-- 5) Idempotent placeholder seeds for the 13 partners (skip if already present by name)
INSERT INTO public.partnerships (name, category, display_order)
SELECT v.name, v.category, v.display_order
FROM (VALUES
  ('AWS Activate', 'Cloud', 10),
  ('Microsoft for Startups', 'Cloud', 11),
  ('Google Cloud', 'Cloud', 12),
  ('Carta', 'Finance', 20),
  ('Stripe', 'Fintech', 21),
  ('Float', 'Fintech', 22),
  ('CMG Inc.', 'Operations & Services', 30),
  ('Notion', 'Productivity', 40),
  ('DocSend', 'Productivity', 41),
  ('BoldHouse', 'Recruiting', 50),
  ('Stem Health', 'Rhino Companies', 60),
  ('Article', 'Rhino Companies', 61),
  ('Promosapien', 'Swag & Merch', 70)
) AS v(name, category, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.partnerships p WHERE p.name = v.name);