import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GH_BASE is set by the GitHub Actions workflow / deploy.sh.
  // Default '/' works for local dev, Netlify and Vercel.
  base: process.env.GH_BASE ?? '/'
})
