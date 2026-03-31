
ALTER TABLE public.partnerships
  ADD COLUMN IF NOT EXISTS detail_pdf_url text,
  ADD COLUMN IF NOT EXISTS applies_to text;
