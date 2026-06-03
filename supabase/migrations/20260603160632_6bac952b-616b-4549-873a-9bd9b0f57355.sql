
-- ── notify_on_save flag on partnerships (transient; reset after queueing) ──
ALTER TABLE public.partnerships
  ADD COLUMN IF NOT EXISTS notify_on_save boolean NOT NULL DEFAULT false;

-- ── digest_queue ──────────────────────────────────────────────────────────
CREATE TABLE public.digest_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('partnership_added','partnership_updated','resource_added','event_added')),
  entity_id uuid,
  title text NOT NULL,
  summary text,
  queued_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  digest_batch_id uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.digest_queue TO authenticated;
GRANT ALL ON public.digest_queue TO service_role;

ALTER TABLE public.digest_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RhinoVC admins can read digest queue"
  ON public.digest_queue FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') ~~ '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can update digest queue"
  ON public.digest_queue FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') ~~ '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can delete digest queue"
  ON public.digest_queue FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') ~~ '%@rhinovc.com');

-- ── digests_sent (audit log) ───────────────────────────────────────────────
CREATE TABLE public.digests_sent (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id uuid NOT NULL,
  subscriber_count integer NOT NULL DEFAULT 0,
  item_count integer NOT NULL DEFAULT 0,
  subject text,
  item_ids uuid[] NOT NULL DEFAULT '{}',
  sent_by_admin_id uuid,
  sent_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.digests_sent TO authenticated;
GRANT ALL ON public.digests_sent TO service_role;

ALTER TABLE public.digests_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RhinoVC admins can read digests sent"
  ON public.digests_sent FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') ~~ '%@rhinovc.com');

-- ── Trigger: partnerships (insert -> added, update -> updated when flagged) ──
CREATE OR REPLACE FUNCTION public.queue_partnership_digest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
    VALUES (
      'partnership_added',
      NEW.id,
      NEW.name || COALESCE(' — ' || NULLIF(NEW.tagline, ''), ''),
      COALESCE(NULLIF(NEW.description, ''), NULLIF(NEW.tagline, ''))
    );
    NEW.notify_on_save := false;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.notify_on_save IS TRUE THEN
      INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
      VALUES (
        'partnership_updated',
        NEW.id,
        NEW.name || COALESCE(' — ' || NULLIF(NEW.tagline, ''), ''),
        COALESCE(NULLIF(NEW.description, ''), NULLIF(NEW.tagline, ''))
      );
    END IF;
    NEW.notify_on_save := false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_queue_partnership_digest
  BEFORE INSERT OR UPDATE ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.queue_partnership_digest();

-- ── Trigger: resources (insert -> added) ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.queue_resource_digest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
  VALUES ('resource_added', NEW.id, NEW.title, NULLIF(NEW.description, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_queue_resource_digest
  AFTER INSERT ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.queue_resource_digest();

-- ── Trigger: events (insert -> added) ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.queue_event_digest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.digest_queue (entity_type, entity_id, title, summary)
  VALUES ('event_added', NEW.id, NEW.title, NULLIF(NEW.description, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_queue_event_digest
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.queue_event_digest();
