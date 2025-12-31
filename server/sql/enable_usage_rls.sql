-- Enable RLS on usage table
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Users can see their own usage
CREATE POLICY "Users can view own usage"
ON public.usage FOR SELECT
USING (auth.uid() = user_id);

-- 2. Policy: Service role has full access
-- This mimics 'admin' access so the backend can manage everything
CREATE POLICY "Service role full access"
ON public.usage
USING (auth.role() = 'service_role');

-- Note: We generally don't want users to UPDATE their usage directly (that's for the backend logic only)
-- So we only grant SELECT to the authenticated user.
