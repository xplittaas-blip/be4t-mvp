/**
 * /api/subscribe.js — BE4T Mailchimp Onboarding Endpoint
 * ─────────────────────────────────────────────────────────────────────────────
 * Vercel Serverless Function (Node.js runtime)
 *
 * POST /api/subscribe
 * Body: { email, fname?, country?, music_genre?, investment_range?, source? }
 *
 * Flow:
 *  1. Validate input
 *  2. Add/update subscriber in Mailchimp (PATCH for idempotency)
 *  3. Return 200 — Supabase update is handled client-side on 200 receipt
 *
 * Merge fields you must create in Mailchimp Dashboard → Audience → Settings → Audience fields:
 *   COUNTRY       | Text
 *   MGENRE        | Text  (Music Genre)
 *   INVRANGE      | Text  (Investment Range)
 *   SOURCE        | Text  (be4t-mvp / charged-satellite / localhost)
 *
 * Environment variables (set in Vercel Dashboard):
 *   MAILCHIMP_API_KEY        — e.g. abc123-us21
 *   MAILCHIMP_AUDIENCE_ID    — your list/audience ID (string of letters & numbers)
 *   MAILCHIMP_SERVER_PREFIX  — the datacenter prefix, e.g. "us21" (from your API key)
 */

import crypto from 'crypto';

// ── CORS helper ───────────────────────────────────────────────────────────────
function setCors(res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
    );
}

// ── MD5 hash for Mailchimp member ID ─────────────────────────────────────────
function emailToMd5(email) {
    return crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // ── 1. Read env ──────────────────────────────────────────────────────────
    const {
        MAILCHIMP_API_KEY,
        MAILCHIMP_AUDIENCE_ID,
        MAILCHIMP_SERVER_PREFIX,
    } = process.env;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
        console.warn('[BE4T/subscribe] Mailchimp not configured — skipping silently');
        // Return 200 so the UI doesn't block the user flow
        return res.status(200).json({
            ok: true,
            skipped: true,
            reason: 'Mailchimp credentials not configured',
        });
    }

    // ── 2. Parse body ────────────────────────────────────────────────────────
    const {
        email,
        fname       = '',
        country     = '',
        music_genre = '',
        investment_range = '',
        source      = 'be4t',
        tags        = [],
    } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid or missing email' });
    }

    // ── 3. Build Mailchimp payload ────────────────────────────────────────────
    // PATCH is idempotent — creates or updates the member
    const memberHash = emailToMd5(email);
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${memberHash}`;

    const payload = {
        email_address: email.toLowerCase().trim(),
        status_if_new: 'subscribed',   // "pending" if you want double opt-in
        status: 'subscribed',
        merge_fields: {
            FNAME:    fname       || email.split('@')[0],
            COUNTRY:  country,
            MGENRE:   music_genre,
            INVRANGE: investment_range,
            SOURCE:   source,
        },
        tags: [
            'be4t-onboarding',
            ...(country   ? [`country-${country.toLowerCase().replace(/\s+/g, '-')}`] : []),
            ...(source    ? [`source-${source}`] : []),
            ...tags,
        ].filter(Boolean),
    };

    // ── 4. Call Mailchimp API ─────────────────────────────────────────────────
    let mailchimpResult = null;
    try {
        const mcRes = await fetch(url, {
            method: 'PUT',   // PUT = upsert (cleaner than PATCH for new members)
            headers: {
                'Content-Type': 'application/json',
                // Basic auth: "anystring:api_key"
                Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
            },
            body: JSON.stringify(payload),
        });

        mailchimpResult = await mcRes.json();

        if (!mcRes.ok) {
            console.error('[BE4T/subscribe] Mailchimp error:', mailchimpResult);
            // Non-blocking: return 200 with warning so UI doesn't block user
            return res.status(200).json({
                ok: true,
                warning: 'Mailchimp subscription failed — user not blocked',
                detail: mailchimpResult?.detail || 'Unknown Mailchimp error',
            });
        }

        console.info(`[BE4T/subscribe] ✓ Subscribed ${email} → Mailchimp`);

        return res.status(200).json({
            ok: true,
            subscribed: true,
            id: mailchimpResult.id,
            status: mailchimpResult.status,
        });

    } catch (err) {
        console.error('[BE4T/subscribe] Network error:', err.message);
        // Still non-blocking
        return res.status(200).json({
            ok: true,
            warning: 'Could not reach Mailchimp — user not blocked',
            error: err.message,
        });
    }
}
