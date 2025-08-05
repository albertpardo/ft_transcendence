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
    root: './', 
   /*  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }, */
    proxy: {
      '/api': {
        target: 'https://backend:8443',
        changeOrigin: true,
        secure: false, // Desactivar verificación de certificado para desarrollo
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
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
  },
  assetsInclude: ['**/*.json']
});
