import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tts-proxy': {
        target: 'http://15.165.189.36:8153',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tts-proxy/, ''),
      },
    },
  },
})
