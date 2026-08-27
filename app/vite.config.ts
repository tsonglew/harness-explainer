import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this repo under /harness-explainer/
  base: '/harness-explainer/',
  plugins: [react(), tailwindcss()],
})
