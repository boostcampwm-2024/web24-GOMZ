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
  },
  resolve: {
    alias: {
      '@': resolve(dirname, 'src'),
      '@socket': resolve(dirname, 'src/socket'),
      '@components': resolve(dirname, 'src/components'),
    },
  },
  test: {
    globals: true,
  },
});
