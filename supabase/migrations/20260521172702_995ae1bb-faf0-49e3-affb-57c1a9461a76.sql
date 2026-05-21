CREATE OR REPLACE FUNCTION public.validate_partner_request_item_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed text[] := ARRAY['resource','partnership','event','intro','other','financing_guide'];
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