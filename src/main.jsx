import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext';
import { isProduction } from './core/env';
import { thirdwebClient, ACTIVE_CHAIN } from './core/web3Client';

// ── ThirdwebProvider: only mount in production mode ───────────────────────────
// Avoids loading blockchain code in showcase/pitch demo environment.
let AppWithProviders;

if (isProduction && thirdwebClient) {
    // Dynamic import keeps Thirdweb out of the showcase bundle entirely
    const { ThirdwebProvider } = await import('thirdweb/react');
    AppWithProviders = (
        <React.StrictMode>
            <ThirdwebProvider>
                <GlobalPlayerProvider>
                    <React.Suspense fallback={null}>
                        <App />
                    </React.Suspense>
                </GlobalPlayerProvider>
            </ThirdwebProvider>
        </React.StrictMode>
    );
} else {
    AppWithProviders = (
        <React.StrictMode>
            <GlobalPlayerProvider>
                <React.Suspense fallback={null}>
                    <App />
                </React.Suspense>
            </GlobalPlayerProvider>
        </React.StrictMode>
    );
}

createRoot(document.getElementById('root')).render(AppWithProviders);
