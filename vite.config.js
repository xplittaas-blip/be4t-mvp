import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env vars for the current mode (.env, .env.[mode], .env.[mode].local)
  const env = loadEnv(mode, process.cwd(), '')

  // Determine APP_MODE:
  // Priority 1: VITE_APP_MODE from Vercel env vars (process.env) or .env file
  // Priority 2: Vite mode flag (--mode production → 'production')
  // Priority 3: fall back to 'showcase'
  const appMode =
    env.VITE_APP_MODE ||
    process.env.VITE_APP_MODE ||
    (mode === 'production' ? 'production' : 'showcase')

  console.log(`[BE4T] Building with APP_MODE=${appMode} (Vite mode: ${mode})`)

  return {
    plugins: [react()],

    // Bake APP_MODE into the bundle as a static constant at build time
    define: {
      __APP_MODE__: JSON.stringify(appMode),
    },

    server: {
      proxy: {
        '/deezer-api': {
          target: 'https://api.deezer.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/deezer-api/, ''),
        },
      },
    },
  }
})
