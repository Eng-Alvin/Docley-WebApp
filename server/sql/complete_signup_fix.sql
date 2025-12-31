-- ==========================================
-- COMPLETE SIGNUP FIX SCRIPT
-- Run this ENTIRE script in Supabase SQL Editor
-- ==========================================

-- 1. Ensure Tables Exist (Schema Validation)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_count INTEGER DEFAULT 0,
    last_reset_date TIMESTAMPTZ DEFAULT now(),
    subscription_tier TEXT DEFAULT 'free',
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT usage_user_id_key UNIQUE(user_id)
);

-- 2. Drop Old Objects to Ensure Clean Slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create Robust Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    -- Insert Profile
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

    -- Insert Usage (Initialization)
    INSERT INTO public.usage (user_id, document_count, last_reset_date, subscription_tier)
    VALUES (
        new.id,
        0,
        now(),
        'free'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- If trigger fails, catch error so specific signup doesn't block (Fail Open)
    -- But log it vigorously (Supabase logs)
    RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix Permissions (Crucial for 500 errors)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.usage TO service_role;
GRANT SELECT ON TABLE public.users TO anon, authenticated;
GRANT SELECT ON TABLE public.usage TO anon, authenticated;

-- RLS Policies (Ensure access)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- Re-apply allow policies to be sure
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own usage" ON public.usage;
CREATE POLICY "Users can view own usage" ON public.usage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access usage" ON public.usage;
CREATE POLICY "Service role full access usage" ON public.usage USING (auth.role() = 'service_role');
