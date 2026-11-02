import { defineConfig } from 'astro/config';

// Served from GitHub Pages at https://r33hab.github.io/stagecraft/
export default defineConfig({
  site: 'https://r33hab.github.io',
  base: '/stagecraft',
  build: { inlineStylesheets: 'never' },
});
