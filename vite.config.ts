import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/smm-assistant-ui/',
  server: {
    proxy: {
      '/api': {
        target: 'https://smm-assistant-dev-553110626568.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'https://smm-assistant-dev-553110626568.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
