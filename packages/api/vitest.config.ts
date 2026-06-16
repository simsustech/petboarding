import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**']
  }
})
