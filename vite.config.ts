import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Base path for the GitHub Pages site.
export default defineConfig({
  base: '/notes/',
  plugins: [vue()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
