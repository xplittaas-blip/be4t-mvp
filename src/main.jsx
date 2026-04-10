import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext';

// Simple, safe entry point — no ThirdwebProvider at boot.
// ThirdwebProvider will be added inside individual components when needed.
createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GlobalPlayerProvider>
            <React.Suspense fallback={null}>
                <App />
            </React.Suspense>
        </GlobalPlayerProvider>
    </React.StrictMode>
);
