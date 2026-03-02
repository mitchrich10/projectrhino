
-- Add approval_required to partnerships
ALTER TABLE public.partnerships ADD COLUMN IF NOT EXISTS approval_required boolean NOT NULL DEFAULT false;

-- Add approval_required to resources
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS approval_required boolean NOT NULL DEFAULT false;

-- Create partner_requests table
CREATE TABLE IF NOT EXISTS public.partner_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  company_name text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('partnership', 'resource')),
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  notes text
);

ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert requests
CREATE POLICY "Authenticated users can insert requests"
ON public.partner_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can read their own requests
CREATE POLICY "Users can read own requests"
ON public.partner_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- RhinoVC admins can update requests
CREATE POLICY "RhinoVC admins can update requests"
ON public.partner_requests FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_partner_requests_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_partner_requests_updated_at
BEFORE UPDATE ON public.partner_requests
FOR EACH ROW EXECUTE FUNCTION public.update_partner_requests_updated_at();
