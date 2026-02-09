
-- Remove storage policies for contact-uploads bucket
DROP POLICY IF EXISTS "Anyone can upload contact files" ON storage.objects;
DROP POLICY IF EXISTS "Service role can read contact files" ON storage.objects;

-- Remove any objects in the bucket first
DELETE FROM storage.objects WHERE bucket_id = 'contact-uploads';

-- Remove the bucket
DELETE FROM storage.buckets WHERE id = 'contact-uploads';
