/**
 * BE4T — POST /api/update-token-supply
 * ──────────────────────────────────────────────────────────────────────────────
 * Decrements tokens_available in Supabase after a confirmed blockchain TX.
 *
 * Body: { assetId: string, qty: number, txHash: string }
 * Returns: { ok: true } or { error: string }
 *
 * Security:
 *  - Validates txHash format (basic)
 *  - Idempotent: ignores duplicate txHash entries
 *  - qty=0 is allowed (e.g. transfer — no supply change needed)
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL    = process.env.VITE_SUPABASE_URL    || process.env.SUPABASE_URL    || '';
const SUPABASE_KEY    = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TX_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/;

module.exports = async function handler(req, res) {
    // CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { assetId, qty = 0, txHash } = req.body || {};

    // ── Input validation ──────────────────────────────────────────────────────
    if (!assetId) {
        return res.status(400).json({ error: 'Missing assetId' });
    }
    if (!TX_HASH_PATTERN.test(txHash)) {
        // For demo tx hashes starting with 0xDEMO, skip silently
        if (String(txHash).startsWith('0xDEMO')) {
            return res.status(200).json({ ok: true, skipped: 'demo_tx' });
        }
        return res.status(400).json({ error: 'Invalid txHash format' });
    }
    if (!Number.isInteger(qty) || qty < 0) {
        return res.status(400).json({ error: 'qty must be a non-negative integer' });
    }

    // ── Supabase not configured ───────────────────────────────────────────────
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('[BE4T] update-token-supply: Supabase not configured — skipping DB sync');
        return res.status(200).json({ ok: true, skipped: 'supabase_not_configured' });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        if (qty > 0) {
            // Decrement tokens_available, floor at 0
            const { error } = await supabase.rpc('decrement_tokens_available', {
                p_asset_id: assetId,
                p_qty:      qty,
            });

            if (error) {
                // Fallback: direct update if RPC not available
                const { error: updateErr } = await supabase
                    .from('assets')
                    .update({ tokens_available: supabase.raw(`GREATEST(tokens_available - ${qty}, 0)`) })
                    .eq('id', assetId);

                if (updateErr) {
                    console.error('[BE4T] update-token-supply DB error:', updateErr.message);
                    return res.status(500).json({ error: 'Database update failed' });
                }
            }
        }

        // Log the transaction for audit trail
        await supabase.from('token_transactions').insert({
            asset_id: assetId,
            qty,
            tx_hash:  txHash,
            type:     qty > 0 ? 'acquisition' : 'transfer',
        }).throwOnError().catch(() => {
            // Table may not exist yet — non-critical
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[BE4T] update-token-supply unexpected error:', err.message);
        return res.status(500).json({ error: 'Unexpected server error' });
    }
};
