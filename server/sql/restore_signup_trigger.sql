-- ===================================================
-- RESTORE SIGNUP TRIGGER
-- Run this to re-enable automatic user initialization
-- ===================================================

-- 1. Define Robust Trigger Function (Fail-Safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    -- Insert Profile (public.users)
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

    -- Insert Usage Stats (public.usage)
    INSERT INTO public.usage (user_id, document_count, last_reset_date, subscription_tier)
    VALUES (new.id, 0, now(), 'free')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach Trigger to Auth Event
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
