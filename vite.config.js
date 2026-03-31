import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Spotify Client Credentials token endpoint
      '/spotify-token': {
        target: 'https://accounts.spotify.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/spotify-token/, ''),
      },
      // Spotify Web API (search, tracks, etc.)
      '/spotify-api': {
        target: 'https://api.spotify.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/spotify-api/, ''),
      },
    },
  },
})
