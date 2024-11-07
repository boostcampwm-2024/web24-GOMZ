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
      '@components': resolve(dirname, 'src/components'),
    },
  },
});
