import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  server: {
    port: 3000,
    open: false, // Desactivamos la apertura automática del navegador
    host: '0.0.0.0', // Importante para que funcione en Docker
    https: {
      key: fs.readFileSync('certs/front.key'),
      cert: fs.readFileSync('certs/front.cert'),
    },
    proxy: {
      '/api': {
        target: 'https://backend:8443',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
