
CREATE OR REPLACE FUNCTION public.short_teaser(_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  clean text;
  slice text;
  stop_pos int;
BEGIN
  IF _text IS NULL THEN RETURN NULL; END IF;
  clean := btrim(regexp_replace(_text, '\s+', ' ', 'g'));
  IF clean = '' THEN RETURN NULL; END IF;
  IF length(clean) <= 150 THEN RETURN clean; END IF;
  slice := substring(clean from 1 for 150);
  stop_pos := greatest(
    position('. ' in slice),
    position('! ' in slice),
    position('? ' in slice)
  );
  IF stop_pos > 60 THEN
    RETURN substring(slice from 1 for stop_pos);
  END IF;
  RETURN btrim(regexp_replace(slice, '\s+\S*$', '')) || '…';
END;
$$;

CREATE OR REPLACE FUNCTION public.queue_partnership_digest()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
    VALUES (
      'partnership_added',
      NEW.id,
      NEW.name || COALESCE(' — ' || NULLIF(NEW.tagline, ''), ''),
      COALESCE(NULLIF(NEW.tagline, ''), public.short_teaser(NEW.description))
    );
    NEW.notify_on_save := false;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.notify_on_save IS TRUE THEN
      INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
      VALUES (
        'partnership_updated',
        NEW.id,
        NEW.name || COALESCE(' — ' || NULLIF(NEW.tagline, ''), ''),
        COALESCE(NULLIF(NEW.tagline, ''), public.short_teaser(NEW.description))
      );
    END IF;
    NEW.notify_on_save := false;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.queue_resource_digest()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
  VALUES ('resource_added', NEW.id, NEW.title, public.short_teaser(NULLIF(NEW.description, '')));
  RETURN NEW;
END;
$function$;
