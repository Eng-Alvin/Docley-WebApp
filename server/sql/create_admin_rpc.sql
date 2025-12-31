-- Function to get total tokens used across the system
CREATE OR REPLACE FUNCTION get_total_tokens()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER -- Runs with privileges of creator (postgres/service_role)
AS $$
  SELECT COALESCE(SUM(tokens_used), 0)
  FROM public.usage;
$$;

-- Grant execution to authenticated users (AdminGuard handles actual authorization in API)
-- Or better, distinct admin role. But for now, app logic protects it.
GRANT EXECUTE ON FUNCTION get_total_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_tokens TO service_role;
