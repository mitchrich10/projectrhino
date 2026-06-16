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
      NEW.name,
      COALESCE(NULLIF(NEW.tagline, ''), public.short_teaser(NEW.description))
    );
    NEW.notify_on_save := false;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.notify_on_save IS TRUE THEN
      INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
      VALUES (
        'partnership_updated',
        NEW.id,
        NEW.name,
        COALESCE(NULLIF(NEW.tagline, ''), public.short_teaser(NEW.description))
      );
    END IF;
    NEW.notify_on_save := false;
  END IF;
  RETURN NEW;
END;
$function$;

-- Backfill existing unsent partnership rows: strip the " — tagline" suffix from titles
UPDATE public.digest_queue
SET title = SPLIT_PART(title, ' — ', 1)
WHERE entity_type IN ('partnership_added', 'partnership_updated')
  AND sent_at IS NULL;