import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
      threshold: 10240,
      compressionOptions: {
        level: 9,
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['mentaliza.loca.lt', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['@heroicons/react'],
          utils: ['date-fns', 'framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})
