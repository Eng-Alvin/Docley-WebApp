-- Ensure tokens_used column exists in public.usage
ALTER TABLE public.usage ADD COLUMN IF NOT EXISTS tokens_used BIGINT DEFAULT 0;

-- Overload/Define get_total_tokens to support global and per-user queries
-- This version supports an optional user_id_param. If not provided, it returns global total.
CREATE OR REPLACE FUNCTION public.get_total_tokens(user_id_param UUID DEFAULT NULL)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF user_id_param IS NULL THEN
    -- Global total tokens used across all users
    RETURN (SELECT COALESCE(SUM(tokens_used), 0) FROM public.usage);
  ELSE
    -- Total tokens used by a specific user
    RETURN (SELECT COALESCE(SUM(tokens_used), 0) FROM public.usage WHERE user_id = user_id_param);
  END IF;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_total_tokens(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_tokens(UUID) TO service_role;

-- Special Case: The NestJS service calls 'get_total_tokens' without parameters
-- We need to ensure a version with NO parameters exists too, or use the default parameter version.
-- PostgreSQL supports overloading, so we can also define:
CREATE OR REPLACE FUNCTION public.get_total_tokens()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.get_total_tokens(NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_total_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_tokens() TO service_role;
