import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 0.0.0.0 allows LAN access (e.g. 100.116.7.43) for Telegram WebView testing
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    // Required for createBrowserRouter: serve index.html for all paths so the
    // SPA router handles navigation instead of the dev server returning 404.
    historyApiFallback: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
})
