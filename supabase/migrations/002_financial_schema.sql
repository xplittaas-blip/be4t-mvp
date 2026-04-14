-- ═══════════════════════════════════════════════════════════════════════════
-- BE4T — Database Migration v2: Financial Asset Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/scjpeqzanyhnurohrtmy/sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extend the `tracks` table with financial fields ────────────────────────
ALTER TABLE tracks
    ADD COLUMN IF NOT EXISTS total_valuation     NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS token_price         NUMERIC(10,4)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_tokens        INTEGER        DEFAULT 1000,
    ADD COLUMN IF NOT EXISTS historical_apy      FLOAT          DEFAULT 12.0,
    ADD COLUMN IF NOT EXISTS distribution_period TEXT           DEFAULT 'monthly'
        CHECK (distribution_period IN ('monthly','quarterly','annual'));

-- Computed index for fast APY queries
CREATE INDEX IF NOT EXISTS idx_tracks_apy ON tracks(historical_apy DESC);

-- ── 2. Create `user_investments` relational table ─────────────────────────────
CREATE TABLE IF NOT EXISTS user_investments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id            TEXT        NOT NULL,  -- matches tracks.id (Spotify or internal)
    tokens_purchased    INTEGER     NOT NULL CHECK (tokens_purchased > 0),
    purchase_price      NUMERIC(14,4) NOT NULL CHECK (purchase_price > 0),
    acquisition_date    TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Snapshot of APY at time of purchase (locked in for ROI calculation)
    apy_at_purchase     FLOAT       NOT NULL DEFAULT 12.0,
    token_price_at_buy  NUMERIC(10,4) NOT NULL DEFAULT 0,
    -- Optional: link to blockchain tx if production
    tx_hash             TEXT,
    chain_id            INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_investments_user_id  ON user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_track_id ON user_investments(track_id);
CREATE INDEX IF NOT EXISTS idx_investments_date     ON user_investments(acquisition_date DESC);

-- ── 3. Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own investments
DROP POLICY IF EXISTS "users_own_investments_select" ON user_investments;
CREATE POLICY "users_own_investments_select"
    ON user_investments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own investments
DROP POLICY IF EXISTS "users_own_investments_insert" ON user_investments;
CREATE POLICY "users_own_investments_insert"
    ON user_investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ── 4. ROI Calculation Function ────────────────────────────────────────────────
-- Returns projected daily roi in USD for a single investment record.
-- Formula: cost × (apy/100/365) × days_elapsed
CREATE OR REPLACE FUNCTION calculate_roi(
    purchase_price NUMERIC,
    apy_rate       FLOAT,
    since          TIMESTAMPTZ DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE
AS $$
    SELECT ROUND(
        purchase_price
        * (apy_rate / 100.0 / 365.0)
        * EXTRACT(EPOCH FROM (COALESCE(since, now()) - since)) / 86400.0
    , 4);
$$;

-- Better version: calculate ROI from acquisition_date to NOW
CREATE OR REPLACE FUNCTION investment_roi_to_date(investment_id UUID)
RETURNS TABLE (
    id              UUID,
    track_id        TEXT,
    tokens_purchased INTEGER,
    purchase_price  NUMERIC,
    apy_at_purchase FLOAT,
    acquisition_date TIMESTAMPTZ,
    days_elapsed    NUMERIC,
    earned_to_date  NUMERIC,
    monthly_earning NUMERIC,
    ownership_pct   NUMERIC
)
LANGUAGE sql STABLE
AS $$
    SELECT
        i.id,
        i.track_id,
        i.tokens_purchased,
        i.purchase_price,
        i.apy_at_purchase,
        i.acquisition_date,
        ROUND(EXTRACT(EPOCH FROM (now() - i.acquisition_date)) / 86400.0, 2) AS days_elapsed,
        ROUND(
            i.purchase_price * (i.apy_at_purchase / 100.0 / 365.0)
            * EXTRACT(EPOCH FROM (now() - i.acquisition_date)) / 86400.0
        , 4) AS earned_to_date,
        ROUND(i.purchase_price * (i.apy_at_purchase / 100.0 / 12.0), 4) AS monthly_earning,
        ROUND(
            i.tokens_purchased::NUMERIC
            / NULLIF(t.total_tokens, 0)::NUMERIC * 100.0
        , 4) AS ownership_pct
    FROM user_investments i
    LEFT JOIN tracks t ON t.id::TEXT = i.track_id
    WHERE i.id = investment_id
      AND i.user_id = auth.uid();
$$;

-- ── 5. View: portfolio summary per user ────────────────────────────────────────
CREATE OR REPLACE VIEW user_portfolio_summary AS
SELECT
    i.user_id,
    i.track_id,
    t.title                                                          AS track_name,
    t.artist_name                                                    AS artist,
    t.total_tokens,
    t.historical_apy,
    SUM(i.tokens_purchased)                                         AS total_tokens_owned,
    SUM(i.purchase_price)                                           AS total_invested,
    MIN(i.acquisition_date)                                         AS first_acquired,
    ROUND(
        SUM(
            i.purchase_price
            * (i.apy_at_purchase / 100.0 / 365.0)
            * EXTRACT(EPOCH FROM (now() - i.acquisition_date)) / 86400.0
        )
    , 4)                                                             AS earned_to_date,
    ROUND(
        SUM(i.purchase_price) * (MAX(i.apy_at_purchase) / 100.0 / 12.0)
    , 4)                                                             AS monthly_earning,
    ROUND(
        SUM(i.tokens_purchased)::NUMERIC / NULLIF(t.total_tokens, 0)::NUMERIC * 100.0
    , 4)                                                             AS ownership_pct
FROM user_investments i
LEFT JOIN tracks t ON t.id::TEXT = i.track_id
WHERE i.user_id = auth.uid()
GROUP BY i.user_id, i.track_id, t.title, t.artist_name, t.total_tokens, t.historical_apy;

-- Grant view access to authenticated users
GRANT SELECT ON user_portfolio_summary TO authenticated;

-- ── 6. Auto-update `updated_at` trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_investments_updated_at ON user_investments;
CREATE TRIGGER trg_investments_updated_at
    BEFORE UPDATE ON user_investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
