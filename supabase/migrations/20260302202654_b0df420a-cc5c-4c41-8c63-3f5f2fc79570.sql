
-- Create resources table
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text,
  file_path text,
  category text NOT NULL DEFAULT 'General',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all resources
CREATE POLICY "Authenticated users can read resources"
ON public.resources FOR SELECT
TO authenticated
USING (true);

-- Only @rhinovc.com emails can manage resources (insert/update/delete)
CREATE POLICY "RhinoVC admins can insert resources"
ON public.resources FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'email' LIKE '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can update resources"
ON public.resources FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' LIKE '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can delete resources"
ON public.resources FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' LIKE '%@rhinovc.com');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.update_resources_updated_at();

-- Storage bucket for resource PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Authenticated users can read files
CREATE POLICY "Authenticated users can read resource files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');

-- Only rhinovc.com can upload/delete
CREATE POLICY "RhinoVC admins can upload resource files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources' AND auth.jwt() ->> 'email' LIKE '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can delete resource files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND auth.jwt() ->> 'email' LIKE '%@rhinovc.com');

CREATE POLICY "RhinoVC admins can update resource files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources' AND auth.jwt() ->> 'email' LIKE '%@rhinovc.com');
