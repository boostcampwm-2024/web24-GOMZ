/// <reference types="vitest" />
import 'dotenv/config';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const { dirname } = import.meta;

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_SIGNALING_SERVER_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(dirname, 'src'),
      '@utils': resolve(dirname, 'src/utils'),
      '@hooks': resolve(dirname, 'src/hooks'),
      '@stores': resolve(dirname, 'src/stroes'),
      '@socket': resolve(dirname, 'src/socket'),
      '@constants': resolve(dirname, 'src/constants'),
      '@components': resolve(dirname, 'src/components'),
      '@customTypes': resolve(dirname, 'src/types'),
    },
  },
  test: {
    globals: true,
  },
});
