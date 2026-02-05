-- Create storage bucket for contact form uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-uploads', 'contact-uploads', false);

-- Allow anyone to upload files to the contact-uploads bucket
CREATE POLICY "Anyone can upload contact files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contact-uploads');

-- Allow service role to read files (for edge function to attach to emails)
CREATE POLICY "Service role can read contact files"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-uploads');