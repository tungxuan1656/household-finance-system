import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: false,
    exclude: ['node_modules/**', 'dist/**'],
  },
})
