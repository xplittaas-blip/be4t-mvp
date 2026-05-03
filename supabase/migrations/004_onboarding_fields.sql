-- BE4T Supabase Migration: Onboarding Fields
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in Supabase Dashboard → SQL Editor
--
-- Adds onboarding tracking fields to public.profiles:
--   onboarding_completed  BOOLEAN  — set to true after Mailchimp subscribe
--   country               TEXT     — from investor form
--   music_genre           TEXT     — favorite genre
--   investment_range      TEXT     — selected range (e.g. "100-499")
--   onboarding_at         TIMESTAMPTZ — when they completed onboarding
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN      DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS country              TEXT,
    ADD COLUMN IF NOT EXISTS music_genre          TEXT,
    ADD COLUMN IF NOT EXISTS investment_range     TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_at        TIMESTAMPTZ;

-- Auto-set onboarding_at when onboarding_completed flips to true
CREATE OR REPLACE FUNCTION public.set_onboarding_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.onboarding_completed = TRUE AND OLD.onboarding_completed IS DISTINCT FROM TRUE THEN
        NEW.onboarding_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_onboarding_complete ON public.profiles;
CREATE TRIGGER on_onboarding_complete
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_onboarding_at();

-- RLS: users can update their own onboarding fields
-- (The existing RLS policy should already cover this if using auth.uid() = id)
-- Uncomment only if you need an explicit policy:
-- CREATE POLICY "users can update own profile" ON public.profiles
--     FOR UPDATE USING (auth.uid() = id);

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('onboarding_completed', 'country', 'music_genre', 'investment_range', 'onboarding_at')
ORDER BY column_name;
