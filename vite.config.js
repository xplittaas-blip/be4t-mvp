import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Deezer API proxy (for preview URL fetching on-demand)
      '/deezer-api': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/deezer-api/, ''),
      },
    },
  },
})
