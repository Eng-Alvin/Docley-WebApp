-- DIAGNOSTIC SCRIPT: DISABLE SIGNUP TRIGGER
-- Run this in Supabase SQL Editor.
-- This removes the custom logic hooking into User Creation.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- After running this, try to Sign Up again.
-- 1. If it WORKS: The issue was inside the Trigger code.
-- 2. If it STILL FAILS with 500: The issue is your Supabase Auth / Email Settings (e.g., SMTP limit reached).
