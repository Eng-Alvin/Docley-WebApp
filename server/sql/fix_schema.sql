-- 1. Posts Table: Ensure it exists
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    cover_image TEXT,
    tags TEXT,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Policies: Drop if exist, then create (Idempotent)
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
CREATE POLICY "Anyone can read published posts"
ON public.posts FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Service role full access posts" ON public.posts;
CREATE POLICY "Service role full access posts"
ON public.posts USING (auth.role() = 'service_role');

-- 3. Documents Table: Add file_content column
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS file_content TEXT;

-- 4. Documents Policies
DROP POLICY IF EXISTS "Service role full access documents" ON public.documents;
CREATE POLICY "Service role full access documents"
ON public.documents USING (auth.role() = 'service_role');
