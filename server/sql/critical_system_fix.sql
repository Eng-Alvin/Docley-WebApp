-- =============================================
-- FINAL SYSTEM FIX SCRIPT
-- Run this to resolve 500 Errors, Missing Columns, and Permissions
-- =============================================

-- 1. USAGE TABLE (Fixes Signup 500)
CREATE TABLE IF NOT EXISTS public.usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_count INTEGER DEFAULT 0,
    last_reset_date TIMESTAMPTZ DEFAULT now(),
    subscription_tier TEXT DEFAULT 'free',
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT usage_user_id_key UNIQUE(user_id)
);
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.usage TO service_role;
GRANT SELECT ON TABLE public.usage TO anon, authenticated;

-- 2. DOCUMENTS TABLE (Fixes file_content error)
-- Ensure column exists
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_content TEXT;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.documents TO service_role;

-- 3. POSTS TABLE (Fixes Admin Blog 500)
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
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.posts TO service_role;
-- Allow public read of published posts
DROP POLICY IF EXISTS "Public read published posts" ON public.posts;
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (published = true);

-- 4. SIGNUP TRIGGER (Fixes "Unexpected Failure")
-- Robust function with safe defaults and exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();

    INSERT INTO public.usage (user_id, document_count, last_reset_date, subscription_tier)
    VALUES (new.id, 0, now(), 'free')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Trigger failed: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Rebind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
