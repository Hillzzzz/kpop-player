// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Important if your index.html is in root
  build: {
    outDir: 'dist', // default
  },
});
