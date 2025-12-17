// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // or 'happy-dom'
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
