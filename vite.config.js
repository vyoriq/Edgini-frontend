import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Enables "@/..." imports globally
    },
  },
  build: {
    outDir: 'dist',       // Output folder
    assetsDir: 'assets',  // Where JS/CSS/images go inside dist
  },
  base: '/',             // Makes all paths relative – essential for S3
  server: {
    proxy: {
      '/curate': {
        target: 'http://127.0.0.1:8000',   // Local FastAPI dev
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
