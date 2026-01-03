import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ecoacoustic.net',
  base: '/',
  output: 'static',
  build: {
    format: 'directory',
  },
});