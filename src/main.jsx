import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalPlayerProvider>
      <React.Suspense fallback="loading...">
        <App />
      </React.Suspense>
    </GlobalPlayerProvider>
  </React.StrictMode>,
)
