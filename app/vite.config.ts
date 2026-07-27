import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'seconds-happens-towers-msg.trycloudflare.com', // Consente questo tunnel specifico
      '.trycloudflare.com' // OPPURE mette in whitelist qualsiasi tunnel di cloudflare, così se si rigenera l'URL non devi ricambiare il config
    ]
  }
})