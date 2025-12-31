// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import svgr from 'vite-plugin-svgr';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [svgr(), tailwindcss()],
  },
});
