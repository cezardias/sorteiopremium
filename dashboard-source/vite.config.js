import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dash/', // Important: the live site hosts this inside the /dash folder
  server: {
    proxy: {
      // Local testing proxy to the live API
      '/api': {
        target: 'https://dash.sorteiospremiummultimarcas.com.br',
        changeOrigin: true,
      }
    }
  }
})
