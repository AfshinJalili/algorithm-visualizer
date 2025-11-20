import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      core: path.resolve(__dirname, './src/core'),
      apis: path.resolve(__dirname, './src/apis'),
      common: path.resolve(__dirname, './src/common'),
      files: path.resolve(__dirname, './src/files'),
      reducers: path.resolve(__dirname, './src/reducers'),
    },
  },
})

