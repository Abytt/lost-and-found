import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  json: {
    namedExports: true,
    stringify: false, // Ensures JSON is treated as an object, not a string
  },
})
