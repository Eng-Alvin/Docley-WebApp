-- Ensure public.usage table exists
CREATE TABLE IF NOT EXISTS public.usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_count INTEGER DEFAULT 0,
    last_reset_date TIMESTAMPTZ DEFAULT now(),
    subscription_tier TEXT DEFAULT 'free',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS just in case
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- Ensure public.users table exists (Profile)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service_role (Backend)
GRANT ALL ON TABLE public.usage TO service_role;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.documents TO service_role;
GRANT ALL ON TABLE public.posts TO service_role;
