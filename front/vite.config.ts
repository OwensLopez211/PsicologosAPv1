import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// URL por defecto para la API
const API_URL = 'https://186.64.113.186'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['mentaliza.loca.lt', 'localhost'],
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
