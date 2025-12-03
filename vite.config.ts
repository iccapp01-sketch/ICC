import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Shim process.env for compatibility with the existing code's usage
    'process.env': {}
  }
})