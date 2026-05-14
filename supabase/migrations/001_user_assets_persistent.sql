-- ─────────────────────────────────────────────────────────────────────────────
-- BE4T — Persistent User Assets & Transactions
-- Migration: 001_user_assets_persistent.sql
--
-- HOW TO APPLY:
--   Supabase Dashboard → SQL Editor → paste & Run
--
-- Tables created / updated:
--   user_assets    — one row per user (portfolio + history JSON blobs)
--   (wallet_addr is kept as secondary index for Web3 identity bridging)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── DROP & RECREATE user_assets with proper auth.uid() anchoring ──────────────
-- (safe: uses IF NOT EXISTS / OR REPLACE patterns)

CREATE TABLE IF NOT EXISTS public.user_assets (
    id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Primary identity: Supabase Auth user (email login, magic link, OAuth)
    user_id       uuid         REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Secondary identity: Thirdweb wallet address (0x...)
    -- Null until user connects a Web3 wallet
    wallet_addr   text,

    -- JSON blobs — BE4T Ledger format
    -- portfolio: { [songId]: { fractions, cost, acquiredAt, name, artist, ... } }
    -- history:   [ { type, amount, assetId, assetName, date }, ... ]
    portfolio     jsonb        NOT NULL DEFAULT '{}',
    history       jsonb        NOT NULL DEFAULT '[]',

    -- Timestamps
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now(),

    -- Each user has exactly ONE row
    CONSTRAINT user_assets_user_id_unique   UNIQUE (user_id),
    CONSTRAINT user_assets_wallet_addr_unique UNIQUE (wallet_addr)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id   ON public.user_assets (user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_wallet    ON public.user_assets (wallet_addr);
CREATE INDEX IF NOT EXISTS idx_user_assets_updated   ON public.user_assets (updated_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_assets_set_updated_at ON public.user_assets;
CREATE TRIGGER user_assets_set_updated_at
    BEFORE UPDATE ON public.user_assets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

-- Users can only read their OWN row
CREATE POLICY "user_assets_select_own"
    ON public.user_assets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own row (first time)
CREATE POLICY "user_assets_insert_own"
    ON public.user_assets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update only their own row
CREATE POLICY "user_assets_update_own"
    ON public.user_assets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role (Edge Functions, admin) has full access
CREATE POLICY "user_assets_service_all"
    ON public.user_assets
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ── Verification queries (run after applying) ─────────────────────────────────
-- SELECT count(*) FROM public.user_assets;
-- SELECT user_id, wallet_addr, updated_at FROM public.user_assets ORDER BY updated_at DESC LIMIT 10;
