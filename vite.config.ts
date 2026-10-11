import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GH_BASE is set by deploy.sh for GitHub Pages.
  // Default '/' works for local dev, Netlify and Vercel.
  base: process.env.GH_BASE ?? '/'
})
