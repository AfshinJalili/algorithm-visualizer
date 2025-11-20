import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({
    include: /\.(jsx|js|tsx|ts)$/,
    babel: {
      parserOpts: {
        plugins: ['jsx'],
      },
    },
  })],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components'),
      'core': path.resolve(__dirname, 'src/core'),
      'apis': path.resolve(__dirname, 'src/apis'),
      'common': path.resolve(__dirname, 'src/common'),
      'files': path.resolve(__dirname, 'src/files'),
      'reducers': path.resolve(__dirname, 'src/reducers'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
});
