import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';
export default defineConfig({site:'https://freesiai.com',output:'static',build:{format:'directory'},integrations:[sitemap({filter:url=>!url.includes('/search/')&&!url.endsWith('/404/')})],vite:{plugins:[tailwind()]}});
