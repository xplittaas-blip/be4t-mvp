import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Play, Pause, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGlobalPlayer } from '../context/GlobalPlayerContext';
import { getMarketplaceData } from '../core/xplit/spotify';
import { getYoutubeTraction, formatViews } from '../core/xplit/youtube';
import {
    fetchSongMetrics,
    fmtMetric,
    getSocialGrowth,
    getWeeklyGrowth,
    YOUTUBE_VIDEO_IDS,
} from '../services/metricsService';
import './SongDetail.css';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { lazy, Suspense } from 'react';
import {
    useActiveAccount,
    useSendTransaction,
} from 'thirdweb/react';
import { getContract, prepareContractCall } from 'thirdweb';
import { client, activeChain } from '../core/thirdwebClient';
import { isProduction, isShowcase } from '../core/env';
import { useDemoBalance } from '../hooks/useDemoBalance';

// be4t components
import FanStatusPanel from '../components/be4t/FanStatusPanel';
import ConfettiBlast from '../components/be4t/ConfettiBlast';
import BenefitCard from '../components/be4t/BenefitCard';
const AcquisitionModal = lazy(() => import('../components/be4t/AcquisitionModal'));

// ── Minimal mono-color platform icons (Anti-Notion: single fill color) ───────
const SpotifyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.56.3z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);
const TikTokIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.54z" />
    </svg>
);

// ── Currency config ───────────────────────────────────────────────────────────────
const CURRENCIES = {
    USD: { symbol: '$', rate: 1,    label: 'USD', flag: '🇺🇸' },
    EUR: { symbol: '€', rate: 0.92, label: 'EUR', flag: '🇪🇺' },
};
const ROYALTY_PER_STREAM = 0.004;  // industry avg $0.003–0.005
const ROYALTY_SHARE      = 0.22;   // 22% of rights tokenized
const GOV_BOND_RATE      = 0.04;   // ~4% — Spain/US 10yr avg 2024

// ── Animated number helper ────────────────────────────────────────────────────
function fmtCurrency(val, sym, decimals = 2) {
    if (!isFinite(val)) return `${sym}0.00`;
    return `${sym}${val.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// ── Payback period in months ────────────────────────────────────────────────
function calcPaybackMonths(investment, monthlyReturn) {
    if (!monthlyReturn || monthlyReturn <= 0) return null;
    return Math.ceil(investment / monthlyReturn);
}

// ── Main ReturnCalculator ───────────────────────────────────────────────────
const ReturnCalculator = ({ streamCount, roiEst, isTrending, paymentFreq = 'monthly',
    tokensTotal = 10_000, tokensAvailable = 7_500, tokenPrice = 10,
    onAmountChange, onInvest, txState = 'idle', demoBalance = 0, isDemo = false }) => {
    const [amount, setAmount]       = useState(250);
    const [currency, setCurrency]   = useState('USD');
    const cur = CURRENCIES[currency];
    const sym = cur.symbol;
    const fxr = cur.rate;

    useEffect(() => {
        const usd = amount / (fxr || 1);
        onAmountChange?.(parseFloat(usd.toFixed(2)));
    }, [amount, currency, fxr, onAmountChange]);

    const trendBoost = isTrending ? 1.08 : 1.0;

    const annualPoolUSD = useMemo(() => {
        const monthlySt = Math.max(streamCount ?? 0, 1_500_000);
        return monthlySt * 12 * ROYALTY_PER_STREAM * ROYALTY_SHARE * trendBoost;
    }, [streamCount, trendBoost]);

    const totalValuationUSD = useMemo(() => {
        const roiDec = (roiEst ?? 18) / 100;
        return roiDec > 0 ? annualPoolUSD / roiDec : annualPoolUSD * 5;
    }, [annualPoolUSD, roiEst]);

    const amountUSD = amount / fxr;

    const participationPct = totalValuationUSD > 0
        ? (amountUSD / totalValuationUSD) * 100
        : 0;

    const annualReturnUSD    = (amountUSD / totalValuationUSD) * annualPoolUSD;
    const annualReturn       = annualReturnUSD * fxr;
    const monthlyReturn      = annualReturn / 12;
    const quarterlyReturn    = annualReturn / 4;
    const displayReturn      = paymentFreq === 'monthly' ? monthlyReturn : quarterlyReturn;
    const displayFreqLabel   = paymentFreq === 'monthly' ? 'Mensual' : 'Trimestral';

    const teaRate = amount > 0 ? (annualReturn / amount) * 100 : 0;

    const paybackMonths = calcPaybackMonths(amount, displayReturn);
    const paybackLabel  = !paybackMonths ? 'N/D'
        : paybackMonths < 13 ? `${paybackMonths} meses`
        : `${(paybackMonths / 12).toFixed(1)} años`;

    const project = (months) => {
        const roiDec    = teaRate / 100;
        const projected = amount * Math.pow(1 + roiDec / 12, months);
        return (projected - amount) * fxr; 
    };
    const proj12 = project(12);
    const proj24 = project(24);
    const proj36 = project(36);

    const bondAnnual    = amount * GOV_BOND_RATE * fxr;
    const bondMultiplier = bondAnnual > 0 ? (annualReturn / bondAnnual).toFixed(1) : '—';

    const tokensBought = Math.floor(amountUSD / (tokenPrice || 10));
    const tokensPct    = tokensTotal > 0 ? (tokensAvailable / tokensTotal) * 100 : 100;
    const tokensLow    = tokensPct < 20;
    const tokensMid    = tokensPct >= 20 && tokensPct < 50;
    const tokenBarColor = tokensLow  ? '#f97316'
                        : tokensMid  ? '#eab308'
                        :              '#10b981';
    const tokensTextColor = tokensLow ? '#fb923c' : tokensMid ? '#fbbf24' : '#4ade80';

    const PRESETS   = [100, 250, 500, 1000].map(v => Math.round(v * fxr));
    const sliderMax = Math.round(5000 * fxr);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <style>{`
                @keyframes calc-slide-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
                .calc-anim { animation: calc-slide-in 0.25s ease; }
                .currency-toggle button { transition: all 0.2s ease; }
                .proj-bar { transition: height 0.4s cubic-bezier(0.25,0.8,0.25,1); }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    Moneda de proyección
                </span>
                <div className="currency-toggle" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', padding: '3px' }}>
                    {Object.entries(CURRENCIES).map(([code, c]) => (
                        <button key={code} onClick={() => setCurrency(code)}
                            style={{
                                padding: '4px 12px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                                fontSize: '0.72rem', fontWeight: '700',
                                background: currency === code ? 'rgba(139,92,246,0.85)' : 'transparent',
                                color: currency === code ? 'white' : 'rgba(255,255,255,0.45)',
                                boxShadow: currency === code ? '0 1px 6px rgba(139,92,246,0.4)' : 'none',
                            }}
                        >
                            {c.flag} {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Monto a Invertir</div>
                        <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1 }} className="calc-anim">
                            {sym}{amount.toLocaleString('es-ES')}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>Tu participación</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c4b5fd' }} className="calc-anim">
                            {participationPct >= 0.001
                                ? `${participationPct.toFixed(participationPct < 0.01 ? 4 : 3)}%`
                                : '<0.001%'
                            }
                        </div>
                    </div>
                </div>

                <input type="range" min={10} max={sliderMax} step={Math.round(10 * fxr)}
                    value={amount} onChange={e => setAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                    <span>Mín: {sym}{Math.round(10 * fxr).toLocaleString('es-ES')}</span>
                    <span>Máx: {sym}{sliderMax.toLocaleString('es-ES')}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
                {PRESETS.map(p => (
                    <button key={p} onClick={() => setAmount(p)} style={{
                        flex: 1, padding: '0.45rem 0', borderRadius: '10px',
                        fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                        border: amount === p ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.09)',
                        background: amount === p ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: amount === p ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                    }}>
                        {sym}{p >= 1000 ? `${p / 1000}K` : p}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '14px', padding: '0.9rem 1rem' }}>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '4px' }}>TEA (APY)</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#a78bfa', letterSpacing: '-0.04em' }} className="calc-anim">
                        {teaRate.toFixed(1)}%
                    </div>
                    {isTrending && <div style={{ fontSize: '0.55rem', color: '#4ade80', marginTop: '2px', fontWeight: '700' }}>⚡ +8% por tendencia</div>}
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.06) 100%)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px', padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Pago {displayFreqLabel}</div>
                        <span style={{ fontSize: '0.48rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '100px', padding: '1px 5px', fontWeight: '700', letterSpacing: '0.5px' }}>{displayFreqLabel.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4ade80', letterSpacing: '-0.03em' }} className="calc-anim">
                        {sym}{displayReturn.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                        {sym}{annualReturn.toFixed(2)} / año
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokensLow ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Tokens Disp.</div>
                        {tokensLow && <span style={{ fontSize: '0.48rem', background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '100px', padding: '1px 5px', fontWeight: '700' }}>CASI AGOTADO</span>}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: tokensTextColor }} className="calc-anim">
                        {tokensAvailable.toLocaleString('es-ES')}
                    </div>
                    <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.25)', marginTop: '2px', marginBottom: '6px' }}>de {tokensTotal.toLocaleString('es-ES')} totales</div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, 100 - tokensPct)}%`, background: tokenBarColor, borderRadius: '100px', boxShadow: `0 0 5px ${tokenBarColor}88`, transition: 'width 0.5s ease' }} />
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.07) 100%)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px', padding: '0.9rem 1rem' }}>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '4px' }}>Compras</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#818cf8', letterSpacing: '-0.03em' }} className="calc-anim">
                        {tokensBought.toLocaleString('es-ES')}
                    </div>
                    <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                        tokens · {sym}{(tokenPrice * fxr).toFixed(2)} c/u
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: '12px' }}>
                <span style={{ fontSize: '1.1rem' }}>🏆</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                    Esta rentabilidad es{' '}
                    <strong style={{ color: '#fbbf24', fontSize: '0.92rem' }}>{bondMultiplier}×</strong>
                    {' '}mayor que el promedio de <strong>bonos del Estado</strong> ({(GOV_BOND_RATE * 100).toFixed(0)}% TEA)
                </span>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.025)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.055)' }}>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.6 }}>
                    TEA estimada: <strong style={{ color: '#c4b5fd' }}>{teaRate.toFixed(1)}%</strong>.
                    Proyección basada en {((streamCount ?? 0) / 1_000_000).toFixed(0)}M streams actuales
                    {isTrending ? ' con boost del 8% por tendencia activa' : ''}.
                    Los retornos pasados no garantizan futuros. Inversión sujeta a riesgo.
                </p>
            </div>
        </div>
    );
};

// ── Main SongDetail ───────────────────────────────────────────────────────────────
const SongDetail = ({ onBack, songId, songData, onRequireAuth, isAuthenticated, session, walletAddress, onInvest }) => {
    const { t: tSong } = useTranslation('song');
    const { t: tCalc } = useTranslation('calculator');

    const [song, setSong]                                   = useState(null);
    const [metrics, setMetrics]                             = useState(null);
    const [ytData, setYtData]                               = useState(null);
    const [isLoading, setIsLoading]                         = useState(true);
    const [showSuccessModal, setShowSuccessModal]           = useState(false);
    const [showAcquisitionModal, setShowAcquisitionModal]   = useState(false);
    const [txState,  setTxState]  = useState('idle');
    const [txResult, setTxResult] = useState(null);
    const [calcAmount, setCalcAmount] = useState(250);

    const { balance, acquire, acquired: isAcquired, hasBalance } = useDemoBalance(walletAddress);
    const account = useActiveAccount();
    const { mutateAsync: sendTx } = useSendTransaction();

    const { playTrack, togglePlay, currentTrack, isPlaying: globalIsPlaying } = useGlobalPlayer();
    const isPlaying = globalIsPlaying && currentTrack?.id === song?.id;
    const calculatorRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                let baseSong = null;

                if (songData) {
                    baseSong = {
                        id:               songData.id,
                        title:            songData.name || songData.title,
                        artist:           songData.metadata?.artist || songData.artist_name || songData.artist || 'Artista',
                        image:            songData.cover_url || songData.image || null,
                        preview_url:      songData.preview_url || songData.metadata?.preview_url || null,
                        deezer_id:        songData.deezer_id || songData.metadata?.deezer_id,
                        spotify_id:       songData.spotify_id || songData.metadata?.spotify_id || null,
                        fansParticipating:(songData.fans_joined || 490).toLocaleString(),
                        fundingProgress:  songData.funding_percent || songData.metadata?.funding_percent || 72,
                        royaltiesShared:  songData.metadata?.yield_estimate
                            ? parseFloat(songData.metadata.yield_estimate)
                            : 18,
                        popularity:       songData.metadata?.popularity || songData.popularity || 90,
                        streams_estimate: songData.metadata?.spotify_streams || 0,
                        roi_est:          parseFloat((songData.metadata?.yield_estimate || '18').replace('%', '')) || 18,
                        total_supply:     songData.total_supply || songData.metadata?.total_supply || 10_000,
                        tokens_available: songData.tokens_available ?? songData.metadata?.tokens_available ??
                            Math.floor((songData.total_supply || 10_000) * 0.72),
                        price:            songData.token_price_usd || songData.price_per_token || songData.metadata?.token_price_usd || 10,
                        is_trending:      songData.is_trending || songData.metadata?.is_trending || false,
                        spotify:   fmtMetric(songData.metadata?.spotify_streams || 0),
                        youtube:   fmtMetric(songData.metadata?.youtube_views   || 0),
                        tiktok:    fmtMetric(songData.metadata?.tiktok_creations || 0),
                        saves:     ((songData.metadata?.popularity || 90) * 1200).toLocaleString(),
                        artistListeners: fmtMetric((songData.metadata?.spotify_streams || 0) * 1.5),
                        perks:            songData.perks || songData.metadata?.perks || [],
                    };
                } else {
                    const allSongs = await getMarketplaceData();
                    const targetId = songId || allSongs[0]?.id;
                    const raw      = allSongs.find(s => s.id === targetId) || allSongs[0];
                    baseSong = {
                        id:               raw.id,
                        title:            raw.title,
                        artist:           raw.artist,
                        image:            raw.cover_image,
                        preview_url:      raw.preview_url,
                        deezer_id:        raw.deezer_id,
                        spotify_id:       raw.spotify_id || null,
                        fansParticipating:(raw.fans_joined || 1248).toLocaleString(),
                        fundingProgress:  raw.funding_progress,
                        royaltiesShared:  `${raw.royalties_shared}%`,
                        popularity:       raw.popularity ?? 90,
                        streams_estimate: raw.streams_estimate,
                        roi_est:          raw.royalties_shared ?? 18,
                        total_supply:     raw.total_supply || 10_000,
                        tokens_available: raw.tokens_available ?? Math.floor((raw.total_supply || 10_000) * 0.72),
                        price:            raw.token_price_usd || raw.price_per_token || 10,
                        is_trending:      raw.is_trending || false,
                        spotify:   fmtMetric(Math.round(raw.streams_estimate * 0.60)),
                        youtube:   fmtMetric(Math.round(raw.streams_estimate * 0.62)),
                        tiktok:    fmtMetric(getSocialGrowth(raw.streams_estimate, raw.popularity)),
                        saves:     ((raw.popularity ?? 90) * 1200).toLocaleString(),
                        artistListeners: formatViews(raw.streams_estimate * 1.5),
                        perks:            raw.perks || [],
                    };
                }

                if (!cancelled) setSong(baseSong);

                const targetId = baseSong.id;
                const songProxy = {
                    id:         targetId,
                    name:       baseSong.title,
                    artist:     baseSong.artist,
                    spotify_id: baseSong.spotify_id,
                    _raw: {
                        deezer_id:  baseSong.deezer_id,
                        spotify_id: baseSong.spotify_id,
                        metadata:   { popularity: baseSong.popularity },
                    },
                    roi_est: baseSong.roi_est ?? 18,
                };
                const [liveMetrics, ytResponse] = await Promise.all([
                    fetchSongMetrics(songProxy).catch(() => null),
                    getYoutubeTraction(targetId).catch(() => null),
                ]);

                if (!cancelled) {
                    if (liveMetrics) {
                        setMetrics(liveMetrics);
                        setSong(prev => prev ? {
                            ...prev,
                            spotify:  fmtMetric(liveMetrics.spotify_streams),
                            youtube:  fmtMetric(liveMetrics.youtube_views),
                            tiktok:   fmtMetric(liveMetrics.tiktok_creations),
                            streams_estimate: liveMetrics.spotify_streams,
                        } : prev);
                    }
                    if (ytResponse) setYtData(ytResponse);
                }
            } catch (err) {
                console.error('[SongDetail] fetch failed:', err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [songId, songData]);

    const growthData     = metrics?.growth ?? getWeeklyGrowth(songId ?? 'default', 18);
    const growthPct      = growthData.pct;
    const growthPositive = growthData.positive;

    const toggleAudio = () => {
        if (!song?.preview_url) { alert('Vista previa no disponible.'); return; }
        if (currentTrack?.id === song.id) { togglePlay(); }
        else { playTrack({ id: song.id, preview_url: song.preview_url, title: song.title, artist: song.artist, cover_image: song.image }); }
    };

    const handleParticipate = () => {
        if (!isAuthenticated) { onRequireAuth(); return; }
        if (isAuthenticated && !walletAddress && !account) {
            onRequireAuth();
            return;
        }

        if (txState === 'processing' || txState === 'success') return;
        setTxState('processing');

        const executeInvestment = async () => {
            const tokenPrice = song.price || 10;
            const total      = parseFloat(calcAmount.toFixed(2));
            const fractions  = Math.max(1, Math.floor(calcAmount / tokenPrice));
            const songMeta   = {
                name:          song.title,
                artist:        song.artist,
                tokenPrice,
                totalSupply:   song.total_supply || 10_000,
                apy:           song.roi_est || 14,
                spotifyStreams: song.streams_estimate || 0,
                coverUrl:      song.image || null,
            };

            try {
                if (account) {
                    const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || "0x51EaE61B3fF980560b4570144f808796E2E10972"; 
                    const USDC_ADDRESS  = import.meta.env.VITE_USDC_ADDRESS  || "0xA87C1f7dcfc7A3102377484B6c8A9bb02447d2fE";

                    const usdcContract = getContract({ client, chain: activeChain, address: USDC_ADDRESS });
                    const vaultContract = getContract({ client, chain: activeChain, address: VAULT_ADDRESS });

                    const totalUSDC = BigInt(Math.floor(total * 1000000));
                    const approveTx = prepareContractCall({
                        contract: usdcContract,
                        method: "function approve(address spender, uint256 amount) returns (bool)",
                        params: [VAULT_ADDRESS, totalUSDC]
                    });
                    
                    const investTx = prepareContractCall({
                        contract: vaultContract,
                        method: "function invest(uint256 id, uint256 quantity)",
                        params: [BigInt(song.id || 1), BigInt(fractions)]
                    });

                    await sendTx(approveTx);
                    await sendTx(investTx);
                } else if (!isShowcase) {
                    throw new Error("Wallet not connected");
                }

                const result = acquire(song.id, total, fractions, songMeta);
                if (result.ok) {
                    setTxResult({ cost: total, fractions, songName: song.title, artistName: song.artist });
                    setTxState('success');
                    setTimeout(() => {
                        document.dispatchEvent(new CustomEvent('navigate', { detail: 'mis-canciones' }));
                    }, 3500);
                } else {
                    setTxState('error');
                    setTimeout(() => setTxState('idle'), 2500);
                }
            } catch (error) {
                console.error("[Web3 Error]", error);
                if (isShowcase) {
                    const result = acquire(song.id, total, fractions, songMeta);
                    if (result.ok) {
                        setTxResult({ cost: total, fractions, songName: song.title, artistName: song.artist });
                        setTxState('success');
                        setTimeout(() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'mis-canciones' })), 3500);
                    } else {
                        setTxState('error');
                        setTimeout(() => setTxState('idle'), 2500);
                    }
                } else {
                    setTxState('error');
                    setTimeout(() => setTxState('idle'), 2500);
                }
            }
        };

        executeInvestment();
    };

    // Reset txState if user navigates back to same page
    useEffect(() => { setTxState('idle'); setTxResult(null); }, [song?.id]);

    if (isLoading || !song) {
        return (
            <div className="song-detail-page" style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                {tSong('loading_track')}
            </div>
        );
    }

    // ── Real stream count for the calculator ──────────────────────────────────
    const liveStreamCount = metrics?.spotify_streams ?? song.streams_estimate;
    const roiEst          = song.roi_est ?? 18;
    const ytVideoId       = YOUTUBE_VIDEO_IDS[songId] ?? null;

    return (
        <div className="song-detail-page animate-fade-in">
            <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={20} /> {tSong('back_explore')}
            </button>

            <div className="detail-centered-layout">
                <div className="detail-left-column">
                    {/* ── 1. HERO ── */}
                    <section className="detail-hero">
                        <div className="hero-image-wrap">
                            <img src={song.image} alt={song.title} className="hero-img" />
                            <button className="hero-play" onClick={toggleAudio}>
                                {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
                            </button>
                        </div>

                        <div className="hero-context text-center mt-4">
                            <h1 className="hero-title">{song.title}</h1>
                            <p className="hero-artist text-secondary">{song.artist}</p>

                            {/* Growth badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '100px', padding: '0.3rem 0.9rem' }}>
                                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {growthPct} growth semanal
                                </span>
                            </div>

                            <button
                                onClick={() => calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                style={{
                                    padding: '0.85rem 2.5rem',
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                                    backgroundSize: '200% auto',
                                    border: 'none', borderRadius: '100px',
                                    color: 'white', fontWeight: '800', fontSize: '1rem',
                                    cursor: 'pointer', letterSpacing: '-0.01em',
                                    boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
                                    transition: 'all 0.3s ease',
                                    marginTop: '1.25rem',
                                    display: 'inline-block',
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.7)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.5)'; }}
                            >
                                {tSong('join_button')}
                            </button>
                        </div>
                    </section>

                    {/* ── 2. PLATFORM METRICS ── */}
                    <section className="detail-section glass-panel mt-5">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>MÉTRICAS DE PLATAFORMAS</h2>
                            {metrics ? (
                                metrics.source === 'live' ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                            borderRadius: '100px', padding: '3px 10px',
                                            fontSize: '0.6rem', color: '#4ade80', fontWeight: '700',
                                            textTransform: 'uppercase', letterSpacing: '1px',
                                        }}>
                                            <span style={{
                                                width: '5px', height: '5px', borderRadius: '50%',
                                                background: '#22c55e', boxShadow: '0 0 6px #22c55e',
                                                animation: 'sd-live-pulse 1.8s ease-in-out infinite',
                                                display: 'inline-block',
                                            }} />
                                            LIVE
                                        </span>
                                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
                                            Actualizado hace {Math.round((Date.now() - (metrics.ts || Date.now())) / 3_600_000) || '<1'}h
                                        </span>
                                    </span>
                                ) : (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
                                        borderRadius: '100px', padding: '3px 10px',
                                        fontSize: '0.6rem', color: '#fbbf24', fontWeight: '700',
                                        textTransform: 'uppercase', letterSpacing: '1px',
                                    }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                                        Calibrado
                                    </span>
                                )
                            ) : (
                                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>cargando datos…</span>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {[
                                { icon: <SpotifyIcon />, label: 'STREAMS',    value: song.spotify,  sub: 'en Spotify',  accent: '#1DB954' },
                                { icon: <YouTubeIcon />, label: 'VIEWS',      value: song.youtube,  sub: 'en YouTube',  accent: '#FF0000' },
                                { icon: <TikTokIcon />,  label: 'CREACIONES', value: song.tiktok,   sub: 'en TikTok',   accent: 'rgba(255,255,255,0.5)' },
                            ].map(({ icon, label, value, sub, accent }) => (
                                <div key={label} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '12px', padding: '0.9rem 0.75rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.4rem' }}>
                                        {icon}
                                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{label}</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'white' }}>{value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Streams / Mes row */}
                        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'linear-gradient(90deg, rgba(29,185,84,0.07) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(29,185,84,0.15)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1DB954', display: 'inline-block', boxShadow: '0 0 5px #1DB95488' }} />
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Streams / Mes (prom.)</span>
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#4ade80', letterSpacing: '-0.02em' }}>
                                {fmtMetric(Math.round(liveStreamCount / 12))}
                            </span>
                        </div>

                        {/* Saves row */}
                        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guardados en playlist</span>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{song.saves}</span>
                        </div>


                        {/* YouTube embed link */}
                        {ytVideoId && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <a
                                    href={`https://www.youtube.com/watch?v=${ytVideoId}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                                        textDecoration: 'none',
                                        padding: '0.4rem 0.8rem',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <YouTubeIcon /> Ver video oficial →
                                </a>
                            </div>
                        )}
                    </section>

                    {/* ── 3. SOBRE ESTA CANCIÓN ── */}
                    <section className="detail-section glass-panel mt-4">
                        <h2 className="section-title">Sobre esta canción</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
                            <strong style={{ color: 'white' }}>"{song.title}"</strong> ha acumulado más de{' '}
                            <strong style={{ color: '#c4b5fd' }}>{fmtMetric(liveStreamCount)}</strong> de streams globales.
                            Este activo tokenizado representa una oportunidad premium de inversión en regalías musicales
                            para fanáticos e inversionistas que creen en {song.artist}.
                        </p>
                        <div style={{ marginTop: '1rem', padding: '0.9rem', borderLeft: '3px solid rgba(139,92,246,0.5)', background: 'rgba(139,92,246,0.05)', borderRadius: '0 8px 8px 0' }}>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0, fontStyle: 'italic' }}>
                                ""{song.title}" es uno de los tracks más influyentes del género con millones de oyentes
                                mensuales en plataformas globales y presencia comprobada en TikTok con{' '}
                                {song.tiktok} creaciones de sonido."
                            </p>
                        </div>
                    </section>

                    {/* ── 4. ARTISTA ── */}
                    <section className="detail-section mt-4 glass-panel artist-context">
                        <h2 className="section-title mb-4">{tSong('artist_about')}</h2>
                        <div className="artist-profile-horizontal">
                            <div className="artist-avatar-large">
                                <img src={song.image} alt={song.artist} />
                            </div>
                            <div className="artist-data">
                                <h3>{song.artist}</h3>
                                <p className="text-secondary text-sm mt-1">
                                    Artista independiente definiendo un nuevo sonido para la audiencia global.
                                </p>
                                <div className="artist-stats mt-3">
                                    <div className="stat-pill">
                                        <SpotifyIcon />
                                        <span className="fw-600 ml-1">{song.artistListeners}</span>
                                        <span className="text-secondary text-sm ml-1">{tSong('artist_listeners')}</span>
                                    </div>
                                    {ytData?.channelSubscribers && (
                                        <div className="stat-pill mt-2">
                                            <YouTubeIcon />
                                            <span className="fw-600 ml-1">{formatViews(ytData.channelSubscribers)}</span>
                                            <span className="text-secondary text-sm ml-1">{tSong('yt_subscribers')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>


                {/* ── 5. RETURN CALCULATOR ── */}
                <section ref={calculatorRef} className="detail-section calculator-section glass-panel highlight-border">

                    {/* Header */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <h2 className="section-title text-gradient" style={{ margin: 0 }}>Calculadora</h2>
                            {song.is_trending && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '100px', padding: '3px 10px',
                                    fontSize: '0.6rem', color: '#f87171', fontWeight: '700',
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                }}>
                                    ⚡ En Tendencia
                                </span>
                            )}
                        </div>
                        <p className="text-secondary" style={{ fontSize: '0.78rem', margin: 0 }}>
                            Planificador de flujo de caja basado en{' '}
                            <strong style={{ color: '#c4b5fd' }}>{fmtMetric(liveStreamCount)}</strong> streams reales
                            {metrics?.source === 'live' && (
                                <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: '#22c55e', fontWeight: '700' }}>● live</span>
                            )}
                        </p>
                    </div>

                    <ReturnCalculator
                        streamCount={liveStreamCount}
                        roiEst={roiEst}
                        isTrending={song.is_trending || metrics?.source === 'live'}
                        paymentFreq="quarterly"
                        tokensTotal={song.total_supply ?? 10_000}
                        tokensAvailable={song.tokens_available ?? song.tokensAvailable ?? 7_500}
                        tokenPrice={song.price ?? song.token_price_usd ?? 10}
                        onAmountChange={setCalcAmount}
                        txState={txState}
                        demoBalance={balance}
                        isDemo={isShowcase}
                    />

                    {/* Social proof */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '0.75rem', background: 'rgba(139,92,246,0.06)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.12)' }}>
                        <p style={{ fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>
                            {tCalc('social_proof', { count: song.fansParticipating })}
                        </p>
                        <p style={{ color: '#f97316', fontSize: '0.8rem', margin: '0.3rem 0 0', fontWeight: '600' }}>
                            {tCalc('micro_fomo')}
                        </p>
                    </div>

                    {/* Fan Status Panel (Bóveda de Beneficios) */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <FanStatusPanel 
                            perks={song.perks}
                            currentTokens={isAcquired(song.id)?.fractions || 0}
                            projectedTokens={Math.floor(calcAmount / (song.price ?? song.token_price_usd ?? 10))}
                        />
                    </div>

                    {/* Insufficient balance warning */}
                    {isShowcase && !hasBalance(calcAmount) && txState === 'idle' && (
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '0.6rem 0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: '600' }}>💸 Saldo insuficiente — ajusta el monto o recarga tu balance demo</span>
                        </div>
                    )}

                    {/* sd-inline-invest: hidden on mobile (< 480px) — sticky bar is used instead */}
                    <div className="sd-inline-invest">
                        <button
                            disabled={txState === 'processing' || txState === 'success'}
                            onClick={handleParticipate}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: txState === 'processing'
                                    ? 'rgba(255,255,255,0.08)'
                                    : txState === 'success'
                                        ? 'linear-gradient(135deg, #10b981, #059669)'
                                        : txState === 'error'
                                            ? 'rgba(239,68,68,0.2)'
                                            : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                                backgroundSize: '200% auto',
                                border: txState === 'error' ? '1px solid rgba(239,68,68,0.4)' : 'none',
                                borderRadius: '14px',
                                color: txState === 'processing' ? 'rgba(255,255,255,0.5)' : 'white',
                                fontWeight: '800', fontSize: '1.05rem',
                                cursor: (txState === 'processing' || txState === 'success') ? 'not-allowed' : 'pointer',
                                letterSpacing: '-0.01em',
                                boxShadow: txState === 'idle' ? '0 4px 24px rgba(124,58,237,0.45)' : 'none',
                                transition: 'all 0.3s ease',
                                marginTop: '1rem',
                            }}
                            onMouseOver={e => { if (txState === 'idle') { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.65)'; }}}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = txState === 'idle' ? '0 4px 24px rgba(124,58,237,0.45)' : 'none'; }}
                        >
                            {txState === 'processing' && '⏳ Procesando...'}
                            {txState === 'success'    && '✅ Activo Adquirido'}
                            {txState === 'error'      && '❌ Saldo insuficiente'}
                            {txState === 'idle'       && '💰 Invertir en esta Canción'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', marginTop: '0.5rem' }}>
                            {isShowcase ? `Saldo disponible: $${balance.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}` : 'Al invertir aceptas los términos y condiciones de BE4T.'}
                        </p>
                    </div>
                </section>
            </div>

            {/* ── Neon Confetti on showcase success ── */}
            <ConfettiBlast active={txState === 'success' && isShowcase} duration={3800} />

            {/* ── Showcase Success Overlay ── */}
            {txState === 'success' && isShowcase && txResult && createPortal(
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(6, 2, 18, 0.85)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem',
                    animation: 'sDetailOverlayIn 0.4s ease',
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg, rgba(20,10,40,0.98) 0%, rgba(12,8,28,0.98) 100%)',
                        border: '1px solid rgba(168,85,247,0.4)',
                        borderRadius: '24px', padding: '2.5rem 2rem',
                        maxWidth: '420px', width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 0 80px rgba(168,85,247,0.18), 0 24px 64px rgba(0,0,0,0.7)',
                        animation: 'sDetailCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem', lineHeight: 1 }}>🏆</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '100px', padding: '0.25rem 0.85rem', marginBottom: '1rem' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', animation: 'sDetailPulse 1.5s ease infinite' }} />
                            <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Inversión Confirmada</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.3rem,4vw,1.75rem)', fontWeight: '900', margin: '0 0 0.5rem', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'white' }}>
                            ¡Felicidades socio!
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                            Ahora eres co-dueño de los derechos de{' '}
                            <strong style={{ color: '#a855f7', fontWeight: '800' }}>&#34;{txResult.songName}&#34;</strong>
                            {' '}de <strong style={{ color: 'white' }}>{txResult.artistName}</strong>.<br />
                            Tus regalías ya están generdándose.
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Invertido</div>
                                <div style={{ fontWeight: '900', color: '#4ade80', fontSize: '1.1rem', fontFamily: "'Courier New',monospace" }}>${txResult.cost.toFixed(2)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tokens</div>
                                <div style={{ fontWeight: '900', color: '#06b6d4', fontSize: '1.1rem', fontFamily: "'Courier New',monospace" }}>{txResult.fractions}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Redirigiendo a Mis Canciones...</p>
                            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', borderRadius: '2px', animation: 'sDetailCountdown 3.5s linear forwards' }} />
                            </div>
                        </div>
                        <button
                            onClick={() => document.dispatchEvent(new CustomEvent('navigate', { detail: 'mis-canciones' }))}
                            style={{ width:'100%', padding:'0.9rem', background:'linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)', backgroundSize:'200% auto', border:'none', borderRadius:'14px', color:'white', fontWeight:'800', fontSize:'0.95rem', cursor:'pointer', letterSpacing:'-0.01em', boxShadow:'0 4px 24px rgba(124,58,237,0.5)' }}
                        >
                            🎵 Ver en Mis Canciones ahora →
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes sDetailOverlayIn { from { opacity:0; } to { opacity:1; } }
                @keyframes sDetailCardIn    { from { opacity:0; transform:scale(0.88) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes sDetailPulse     { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                @keyframes sDetailCountdown { from { width:0%; } to { width:100%; } }
            `}</style>

            {/* ── AcquisitionModal (real blockchain flow) ── */}
            {showAcquisitionModal && song && createPortal(
                <Suspense fallback={null}>
                    <AcquisitionModal
                        asset={{
                            ...(song._raw || {}),
                            // Merge normalized fields the modal needs
                            name:              song.title,
                            token_price_usd:   song.price ?? 10,
                            total_supply:      song.total_supply ?? 10_000,
                            tokens_available:  song.tokens_available ?? 7_500,
                            roi_est:           song.roi_est ?? 18,
                            spotify_streams:   liveStreamCount,
                        }}
                        onClose={() => setShowAcquisitionModal(false)}
                    />
                </Suspense>,
                document.body
            )}

            {/* ── Sticky mobile invest bar (< 480px only — CSS hides it on desktop) ── */}
            {song && isShowcase && txState !== 'success' && (
                <div className="sd-sticky-invest-bar">
                    <button
                        className="sd-invest-btn"
                        disabled={txState === 'processing'}
                        onClick={handleParticipate}
                        style={{
                            width: '100%', padding: '1rem',
                            background: txState === 'processing'
                                ? 'rgba(255,255,255,0.08)'
                                : txState === 'error'
                                    ? 'rgba(239,68,68,0.2)'
                                    : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #06b6d4 100%)',
                            border: 'none', borderRadius: '14px',
                            color: txState === 'processing' ? 'rgba(255,255,255,0.5)' : 'white',
                            fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                            boxShadow: txState === 'idle' ? '0 4px 20px rgba(124,58,237,0.5)' : 'none',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                        }}
                    >
                        {txState === 'processing' && '⏳ Procesando...'}
                        {txState === 'error'      && '❌ Saldo insuficiente'}
                        {txState === 'idle'       && `💰 Invertir $${calcAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ahora`}
                    </button>
                    <p className="sd-balance-tag" style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                        Saldo: <strong style={{ color: '#4ade80' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </p>
                </div>
            )}
        </div>
    );
};

export default SongDetail;
