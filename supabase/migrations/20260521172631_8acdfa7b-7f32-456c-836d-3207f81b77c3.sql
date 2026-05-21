-- Drop the old single-value CHECK constraint (name may vary)
ALTER TABLE public.partner_requests DROP CONSTRAINT IF EXISTS partner_requests_item_type_check;

-- Convert column to text[]; existing values become single-element arrays.
-- Old rows stored comma-separated lists like "resource, partnership" — split them.
ALTER TABLE public.partner_requests
  ALTER COLUMN item_type TYPE text[]
  USING (
    CASE
      WHEN item_type IS NULL THEN ARRAY[]::text[]
      ELSE string_to_array(regexp_replace(item_type, '\s*,\s*', ',', 'g'), ',')
    END
  );

ALTER TABLE public.partner_requests
  ALTER COLUMN item_type SET DEFAULT ARRAY[]::text[];

-- Validation trigger: each element must be in the allowed set
CREATE OR REPLACE FUNCTION public.validate_partner_request_item_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed text[] := ARRAY['resource','partnership','event','intro','other'];
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
$$;

DROP TRIGGER IF EXISTS validate_partner_request_item_type_trg ON public.partner_requests;
CREATE TRIGGER validate_partner_request_item_type_trg
BEFORE INSERT OR UPDATE ON public.partner_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_partner_request_item_type();