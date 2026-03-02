
-- Create approved_domains table
CREATE TABLE public.approved_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approved_domains ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read approved domains (needed for validation logic)
CREATE POLICY "Authenticated users can read approved domains"
ON public.approved_domains
FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage (for admin inserts)
CREATE POLICY "Service role can manage approved domains"
ON public.approved_domains
FOR ALL
TO service_role
USING (true);
