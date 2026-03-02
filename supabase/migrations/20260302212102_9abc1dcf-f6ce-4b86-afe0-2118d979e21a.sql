
-- Make item_id nullable so general (non-item-specific) requests can be submitted
ALTER TABLE public.partner_requests
  ALTER COLUMN item_id DROP NOT NULL;
