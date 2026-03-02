
ALTER TABLE public.partner_requests
  ADD COLUMN IF NOT EXISTS response text;
