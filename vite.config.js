import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n'
          if (id.includes('react') || id.includes('react-dom')) return 'react'
          return 'vendor'
        },
      },
    },
  },
})
