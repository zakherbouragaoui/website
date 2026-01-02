import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://zakherbouragaoui.github.io',
  base: '/website',
  output: 'static', // ← ADD THIS LINE
  build: {
    format: 'directory', // ← ADD THIS LINE
  },
});