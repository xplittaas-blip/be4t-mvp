/**
 * BE4T — Investment Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles reading and writing user_investments from/to Supabase.
 * In Showcase mode, this is a no-op (useDemoBalance handles everything locally).
 * In Production mode, this writes to Supabase and queries the portfolio view.
 *
 * ROI Formula:
 *   earned = purchase_price × (apy_at_purchase / 100 / 365) × days_elapsed
 *
 * Usage:
 *   import { recordInvestment, getPortfolio } from '../services/investmentService';
 */

import { supabase, isSupabaseReady } from '../core/xplit/supabaseClient';
import { isShowcase } from '../core/env';

const ROYALTY_PER_MILLION_STREAMS = 3000; // $3,000 per 1M streams/year (conservative)

// ── ROI Calculator (client-side, mirrors the SQL function) ────────────────────
/**
 * Calculate accrued royalties for an investment.
 * @param {number} purchasePrice   - total USD invested
 * @param {number} apyRate         - annual percentage yield (e.g. 14.2)
 * @param {Date|string} since      - acquisition date
 * @returns {number} earned in USD
 */
export function calculateROI(purchasePrice, apyRate, since) {
    const msElapsed  = Date.now() - new Date(since).getTime();
    const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    return parseFloat(
        (purchasePrice * (apyRate / 100 / 365) * daysElapsed).toFixed(4)
    );
}

/**
 * Calculate dynamic APY from stream data.
 * Based on: (annual_royalties / total_valuation) × 100
 * @param {number} spotifyStreams   - total Spotify streams
 * @param {number} totalValuation  - song asset valuation in USD
 * @returns {number} APY as percentage
 */
export function calculateAPYFromStreams(spotifyStreams, totalValuation) {
    if (!spotifyStreams || !totalValuation || totalValuation <= 0) return 10.0;
    const annualRoyalties = (spotifyStreams / 1_000_000) * ROYALTY_PER_MILLION_STREAMS;
    const apy = (annualRoyalties / totalValuation) * 100;
    return parseFloat(Math.min(Math.max(apy, 2), 40).toFixed(2)); // clamp 2%-40%
}

/**
 * Calculate monthly earnings for a position.
 * @param {number} purchasePrice
 * @param {number} apyRate
 */
export function monthlyEarnings(purchasePrice, apyRate) {
    return parseFloat((purchasePrice * (apyRate / 100 / 12)).toFixed(4));
}

// ── Production: Write investment to Supabase ──────────────────────────────────
/**
 * Record a new investment in Supabase (production only).
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.trackId
 * @param {number} params.tokensPurchased
 * @param {number} params.purchasePrice     - total USD spent
 * @param {number} params.apyAtPurchase
 * @param {number} params.tokenPriceAtBuy   - per-token price at time of purchase
 * @param {string} [params.txHash]          - blockchain tx hash (if minted)
 * @param {number} [params.chainId]         - 84532 = Base Sepolia
 * @returns {Promise<{ data, error }>}
 */
export async function recordInvestment({
    userId,
    trackId,
    tokensPurchased,
    purchasePrice,
    apyAtPurchase,
    tokenPriceAtBuy,
    txHash = null,
    chainId = 84532,
}) {
    if (isShowcase || !isSupabaseReady) {
        console.info('[investmentService] Showcase mode — skipping Supabase write');
        return { data: null, error: null };
    }
    if (!userId || !trackId) {
        return { data: null, error: new Error('userId and trackId are required') };
    }

    const { data, error } = await supabase
        .from('user_investments')
        .insert({
            user_id:          userId,
            track_id:         trackId,
            tokens_purchased: tokensPurchased,
            purchase_price:   purchasePrice,
            apy_at_purchase:  apyAtPurchase,
            token_price_at_buy: tokenPriceAtBuy,
            tx_hash:          txHash,
            chain_id:         chainId,
            acquisition_date: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) console.error('[investmentService] recordInvestment error:', error);
    return { data, error };
}

// ── Production: Read portfolio from Supabase ──────────────────────────────────
/**
 * Fetch the authenticated user's full portfolio from the Supabase view.
 * Adds client-side ROI calculation on top of DB data.
 * @returns {Promise<{ portfolio: object[], error }>}
 */
export async function getPortfolio() {
    if (isShowcase || !isSupabaseReady) {
        return { portfolio: [], error: null };
    }

    const { data, error } = await supabase
        .from('user_portfolio_summary')
        .select('*');

    if (error) {
        console.error('[investmentService] getPortfolio error:', error);
        return { portfolio: [], error };
    }

    // Enrich with client-side freshly-computed ROI
    const portfolio = (data || []).map(row => ({
        ...row,
        earnedToDate:   calculateROI(row.total_invested, row.historical_apy, row.first_acquired),
        monthlyEarning: monthlyEarnings(row.total_invested, row.historical_apy),
    }));

    return { portfolio, error: null };
}

/**
 * Fetch raw investment rows for a specific user (admin view).
 * @param {string} userId
 */
export async function getUserInvestments(userId) {
    if (!isSupabaseReady) return { data: [], error: null };

    const { data, error } = await supabase
        .from('user_investments')
        .select(`
            id,
            track_id,
            tokens_purchased,
            purchase_price,
            apy_at_purchase,
            token_price_at_buy,
            acquisition_date,
            tx_hash,
            chain_id
        `)
        .eq('user_id', userId)
        .order('acquisition_date', { ascending: false });

    return { data: data || [], error };
}

// ── Hybrid hook: merges local (showcase) + remote (production) portfolio ───────
/**
 * Used by Portfolio.jsx to get investments regardless of mode.
 * In showcase: returns useDemoBalance.portfolio (passed as arg).
 * In production: fetches from Supabase.
 *
 * @param {object[]} localPortfolio  - from useDemoBalance.portfolio
 * @returns {Promise<object[]>}
 */
export async function resolvePortfolio(localPortfolio = []) {
    if (isShowcase) return localPortfolio;

    const { portfolio } = await getPortfolio();
    return portfolio;
}
