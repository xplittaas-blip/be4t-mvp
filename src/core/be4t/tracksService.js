/**
 * BE4T Track Data Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Showcase mode → returns static assetsData (zero network calls)
 * Production mode → fetches from Supabase `tracks` table
 *
 * The returned objects are normalized to the same shape as assetsData so all
 * components work identically regardless of mode.
 */
import { isShowcase } from '../env';
import { supabase, isSupabaseReady } from '../xplit/supabaseClient';
import { assetsData } from './data/assetsData';

// ── Field normalizer — maps Supabase row → internal asset shape ───────────────
const normalizeTrack = (row) => ({
    id:                   row.id,
    name:                 row.title,
    symbol:               row.symbol,
    asset_type:           row.asset_type || 'music',
    token_price_usd:      Number(row.price_per_token) || 10,
    total_supply:         row.total_supply || 1000,
    valuation_usd:        Number(row.valuation_usd) || (Number(row.price_per_token) * (row.total_supply || 1000)),
    is_tokenized:         Boolean(row.token_contract_address),
    contract_address:     row.token_contract_address || null,
    cover_url:            row.cover_url || null,
    preview_url:          row.preview_url || null,
    image:                row.cover_url || null,
    metadata: {
        artist:             row.artist,
        isrc:               row.isrc || null,
        yield_estimate:     row.apy_estimated || '—',
        genre:              row.genre || '—',
        label:              row.label || '—',
        release_year:       row.release_year || null,
        bio:                row.bio || '',
        review:             row.review || '',
        spotify_streams:    row.spotify_streams || 0,
        youtube_views:      row.youtube_views || 0,
        tiktok_creations:   row.tiktok_creations || 0,
        monthly_listeners:  row.monthly_listeners || 0,
        spotify_url:        row.spotify_url || null,
    },
    // Keep raw row for debugging
    _source: 'supabase',
});

// ── Main fetch function ───────────────────────────────────────────────────────
/**
 * fetchTracks()
 * Returns an array of normalized asset objects.
 * Showcase: instant return of static data.
 * Production: fetches from Supabase, falls back to static data on error.
 */
export async function fetchTracks() {
    // ── SHOWCASE: use local static data ──────────────────────────────────────
    if (isShowcase) {
        return assetsData;
    }

    // ── PRODUCTION: fetch from Supabase ──────────────────────────────────────
    if (!isSupabaseReady) {
        console.warn('[tracksService] Supabase not ready — falling back to static data');
        return assetsData;
    }

    try {
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            console.info('[tracksService] No tracks in DB yet — using static seed data');
            return assetsData;
        }

        return data.map(normalizeTrack);
    } catch (err) {
        console.error('[tracksService] Fetch failed:', err.message);
        // Graceful fallback — never break the UI
        return assetsData;
    }
}

/**
 * fetchTrackById(id)
 * Production: fetches a single track from Supabase.
 * Showcase: finds it in the static array.
 */
export async function fetchTrackById(id) {
    if (isShowcase) {
        return assetsData.find(a => String(a.id) === String(id)) || null;
    }

    if (!isSupabaseReady) return null;

    try {
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return normalizeTrack(data);
    } catch (err) {
        console.error('[tracksService] fetchTrackById failed:', err.message);
        return null;
    }
}
