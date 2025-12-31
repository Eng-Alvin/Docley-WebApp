-- Create global_settings table
CREATE TABLE IF NOT EXISTS public.global_settings (
    id INT PRIMARY KEY DEFAULT 1, -- Single row table pattern
    maintenance_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1) -- Ensure only one row exists
);

-- Insert default row if not exists
INSERT INTO public.global_settings (id, maintenance_active)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read (for App check)
CREATE POLICY "Everyone can read global settings"
ON public.global_settings FOR SELECT
USING (true);

-- Policy: Only Admins can update
-- Assuming we use Supabase Auth and admin role check
CREATE POLICY "Admins can update global settings"
ON public.global_settings FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role' OR
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);
