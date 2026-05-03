import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThirdwebProvider } from 'thirdweb/react';
import App from './App.jsx';
import './index.css';
import './i18n';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext';

/**
 * BE4T Root — ThirdwebProvider is now GLOBAL.
 * This allows any component tree to use useActiveAccount(),
 * useActiveWallet(), etc. without wrapping themselves.
 *
 * Chain + Wallets are configured in src/core/thirdwebClient.js.
 * The actual ConnectButton UI lives in NavCTA.jsx.
 */
createRoot(document.getElementById('root')).render(
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
