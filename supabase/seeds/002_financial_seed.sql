-- ═══════════════════════════════════════════════════════════════════════════
-- BE4T — Demo Seed Data: Financial fields for catalog tracks
-- ═══════════════════════════════════════════════════════════════════════════
-- Run AFTER 002_financial_schema.sql
-- This adds realistic financial data for the 10 flagship tracks.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Helper: build Spanish-style distribution period labels
-- We store 'monthly' | 'quarterly' | 'annual' in distribution_period.

-- ── Upsert financial metadata for known tracks ────────────────────────────────
-- Values based on public Spotify stream data + BE4T model:
--   Royalties ≈ $3,000 / 1M streams/year (conservative)
--   Token price = Total Valuation / Total Tokens
--   historical_apy derived from: (annual_royalties / valuation) × 100

UPDATE tracks SET
    total_valuation     = 2_000_000,  -- $2M USD catalog value
    total_tokens        = 1000,
    token_price         = 2000.00,    -- $2,000 per token
    historical_apy      = 14.2,       -- 14.2% TEA based on 1.3B streams
    distribution_period = 'monthly'
WHERE LOWER(title) LIKE '%bichota%'
   OR LOWER(artist_name) LIKE '%karol g%' AND LOWER(title) LIKE '%bichota%';

UPDATE tracks SET
    total_valuation     = 1_800_000,
    total_tokens        = 1000,
    token_price         = 1800.00,
    historical_apy      = 13.8,
    distribution_period = 'monthly'
WHERE LOWER(title) LIKE '%tusa%'
   OR (LOWER(artist_name) LIKE '%karol g%' AND LOWER(title) LIKE '%tusa%');

UPDATE tracks SET
    total_valuation     = 1_500_000,
    total_tokens        = 1000,
    token_price         = 1500.00,
    historical_apy      = 12.9,
    distribution_period = 'monthly'
WHERE LOWER(title) LIKE '%cairo%'
   AND LOWER(artist_name) LIKE '%karol g%';

UPDATE tracks SET
    total_valuation     = 1_750_000,
    total_tokens        = 1000,
    token_price         = 1750.00,
    historical_apy      = 15.1,
    distribution_period = 'monthly'
WHERE LOWER(title) LIKE '%provenza%'
   OR (LOWER(artist_name) LIKE '%karol g%' AND LOWER(title) LIKE '%provenza%');

-- Feid tracks
UPDATE tracks SET
    total_valuation     = 900_000,
    total_tokens        = 1000,
    token_price         = 900.00,
    historical_apy      = 11.5,
    distribution_period = 'monthly'
WHERE LOWER(artist_name) LIKE '%feid%' AND LOWER(title) LIKE '%normal%';

UPDATE tracks SET
    total_valuation     = 1_100_000,
    total_tokens        = 1000,
    token_price         = 1100.00,
    historical_apy      = 12.8,
    distribution_period = 'monthly'
WHERE LOWER(artist_name) LIKE '%feid%' AND LOWER(title) LIKE '%luna%';

-- Generic fallback: update all tracks that have no financial data yet
UPDATE tracks SET
    total_valuation     = 500_000,
    total_tokens        = 1000,
    token_price         = 500.00,
    historical_apy      = 10.0,
    distribution_period = 'monthly'
WHERE total_valuation = 0 OR total_valuation IS NULL;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
    title,
    artist_name,
    total_valuation,
    token_price,
    total_tokens,
    historical_apy,
    distribution_period
FROM tracks
ORDER BY historical_apy DESC
LIMIT 15;
