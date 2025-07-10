import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

process.env.VITE_APP_VERSION = process.env.npm_package_version

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION)
  }
}) 