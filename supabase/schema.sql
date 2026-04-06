-- ─────────────────────────────────────────────────────────────────────────────
-- BE4T — Database Schema Backup
-- Project: scjpeqzanyhnurohrtmy (xplittaas-blip's Project)
-- Last updated: 2026-04-06
--
-- HOW TO RESTORE:
--   1. Go to your Supabase project → SQL Editor
--   2. Paste this entire file and click Run
--   3. All tables, constraints, RLS policies will be recreated
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- provides gen_random_uuid()

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE: waitlist_leads
-- Purpose: Captures early-access signups from the BE4T waitlist modal.
-- Triggered email: Supabase Edge Function "welcome-email" via DB Webhook.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS public.waitlist_leads (
    id           uuid         DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Lead info
    full_name    text         NOT NULL,
    email        text         NOT NULL,
    profile_type text         NOT NULL
                              CHECK (profile_type IN ('inversionista', 'artista', 'sello', 'fan')),
    country      text,

    -- Attribution
    source       text         NOT NULL DEFAULT 'be4t_pitch_modal',

    -- Timestamps
    created_at   timestamptz  NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT waitlist_leads_email_unique UNIQUE (email)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
-- Fast lookups by email (also enforced by UNIQUE constraint above)
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_email
    ON public.waitlist_leads (email);

-- Filter leads by profile type (for CRM exports)
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_profile
    ON public.waitlist_leads (profile_type);

-- Sort by signup date (most recent first in admin view)
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_created_at
    ON public.waitlist_leads (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Anon users (frontend) can INSERT (sign up for waitlist)
CREATE POLICY "anon_insert_waitlist"
    ON public.waitlist_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Service role (Edge Functions, admin) can SELECT all rows
CREATE POLICY "service_select_waitlist"
    ON public.waitlist_leads
    FOR SELECT
    TO service_role
    USING (true);

-- Service role can UPDATE (e.g. mark as invited)
CREATE POLICY "service_update_waitlist"
    ON public.waitlist_leads
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EDGE FUNCTION WEBHOOK
-- The DB Webhook "on_waitlist_insert" is configured in the Supabase dashboard
-- (Database → Webhooks). It fires on INSERT to waitlist_leads and calls:
--   https://<project-ref>.supabase.co/functions/v1/welcome-email
-- Source code: supabase/functions/welcome-email/index.ts
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ── Useful admin queries ──────────────────────────────────────────────────────

-- Count leads by profile type:
-- SELECT profile_type, COUNT(*) FROM waitlist_leads GROUP BY profile_type ORDER BY count DESC;

-- Export all leads (ordered by signup date):
-- SELECT full_name, email, profile_type, country, source, created_at
--   FROM waitlist_leads
--   ORDER BY created_at DESC;

-- Check for duplicate emails (should always be 0 due to UNIQUE constraint):
-- SELECT email, COUNT(*) FROM waitlist_leads GROUP BY email HAVING COUNT(*) > 1;
