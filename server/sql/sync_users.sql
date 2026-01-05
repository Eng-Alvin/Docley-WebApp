-- 1. Create the Database Function
-- This function will be called by the trigger to sync data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NOW(),
    NOW()
  );
  
  -- Also initialize a usage record for the new user
  INSERT INTO public.usage (user_id, document_count, last_reset_date, subscription_tier)
  VALUES (NEW.id, 0, NOW(), 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
-- This sets up the automatic sync for all future signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Manual Sync Script
-- Run this once to sync existing users that are missing from public.users
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
    created_at,
    updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Also sync missing usage records
INSERT INTO public.usage (user_id, document_count, last_reset_date, subscription_tier)
SELECT id, 0, NOW(), 'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.usage)
ON CONFLICT (user_id) DO NOTHING;
