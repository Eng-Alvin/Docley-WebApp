-- Enable the storage schema if not already enabled (usually is default)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the 'blog-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true; -- Ensure it is public

-- 2. Enable RLS on objects (it should be enabled by default for storage.objects, but good to be safe)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public Read Access (Anyone can view images)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

-- 4. Policy: Authenticated Upload Access (Logged in users can upload)
-- You can restrict this further to admins only if you check a role column
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'blog-images' );

-- 5. Policy: Owner Update/Delete (Users can update/delete their own uploads)
DROP POLICY IF EXISTS "Owner Update/Delete" ON storage.objects;
CREATE POLICY "Owner Update/Delete"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'blog-images' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'blog-images' AND auth.uid() = owner );
