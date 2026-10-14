import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/customers': 'http://localhost:3000',
      '/products': 'http://localhost:3000',
      '/wishlist': 'http://localhost:3000',
      '/cart': 'http://localhost:3000',
    },
  },
});
