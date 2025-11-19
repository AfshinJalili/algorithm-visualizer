import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      // Preserve jsconfig.json baseUrl: "src" behavior
      'apis': path.resolve(__dirname, './src/apis'),
      'common': path.resolve(__dirname, './src/common'),
      'components': path.resolve(__dirname, './src/components'),
      'core': path.resolve(__dirname, './src/core'),
      'files': path.resolve(__dirname, './src/files'),
      'reducers': path.resolve(__dirname, './src/reducers'),
      // Handle Webpack's ~ prefix in SCSS imports
      '~': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add src directory to Sass include paths to handle ~common imports
        includePaths: [path.resolve(__dirname, './src')]
      }
    }
  },
  server: {
    port: 3000,
    // Preserve CRA proxy behavior
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true
  },
  // Remove NODE_OPTIONS workaround
  define: {
    'process.env': {}
  }
});

