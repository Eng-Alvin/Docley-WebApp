-- 1. Create the 'blog-images' bucket (Force Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Policy: Public Read Access (Anyone can view images)
-- We drop first to ensure clean state, but specific to this policy name
DROP POLICY IF EXISTS "Public Access Blog Images" ON storage.objects;

CREATE POLICY "Public Access Blog Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

-- 3. Policy: Authenticated Upload Access (Logged in users can upload)
DROP POLICY IF EXISTS "Authenticated Upload Blog Images" ON storage.objects;

CREATE POLICY "Authenticated Upload Blog Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'blog-images' );

-- 4. Policy: Users can update/delete their own uploads
DROP POLICY IF EXISTS "Owner Manage Blog Images" ON storage.objects;

CREATE POLICY "Owner Manage Blog Images"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'blog-images' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'blog-images' AND auth.uid() = owner );
