import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext';
import { isProduction } from './core/env';
import { thirdwebClient } from './core/web3Client';

// ── App wrapper — conditionally adds ThirdwebProvider in production ────────────
// Uses a component (NOT top-level await) to avoid ES module restrictions.
const Root = () => {
    // Lazy-load ThirdwebProvider only in production to keep showcase bundle lean
    const [Provider, setProvider] = React.useState(null);

    React.useEffect(() => {
        if (!isProduction || !thirdwebClient) return;
        import('thirdweb/react').then(mod => {
            setProvider(() => mod.ThirdwebProvider);
        }).catch(err => {
            console.error('[BE4T] ThirdwebProvider failed to load:', err);
        });
    }, []);

    const content = (
        <GlobalPlayerProvider>
            <React.Suspense fallback={null}>
                <App />
            </React.Suspense>
        </GlobalPlayerProvider>
    );

    if (isProduction && thirdwebClient) {
        if (!Provider) return content; // render immediately, Provider loads async
        return <Provider>{content}</Provider>;
    }

    return content;
};

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);
