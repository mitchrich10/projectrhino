
-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  location text,
  rsvp_url text,
  recording_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read events
CREATE POLICY "Authenticated users can read events"
ON public.events FOR SELECT
TO authenticated
USING (true);

-- RhinoVC admins can insert events
CREATE POLICY "RhinoVC admins can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- RhinoVC admins can update events
CREATE POLICY "RhinoVC admins can update events"
ON public.events FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- RhinoVC admins can delete events
CREATE POLICY "RhinoVC admins can delete events"
ON public.events FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- Auto-update updated_at trigger
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_resources_updated_at();

-- Storage bucket for event recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can read recordings
CREATE POLICY "Authenticated users can read recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recordings');

-- RhinoVC admins can upload recordings
CREATE POLICY "RhinoVC admins can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (auth.jwt() ->> 'email') LIKE '%@rhinovc.com'
);

-- RhinoVC admins can delete recordings
CREATE POLICY "RhinoVC admins can delete recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (auth.jwt() ->> 'email') LIKE '%@rhinovc.com'
);
