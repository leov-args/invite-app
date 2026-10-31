import { defineConfig, type Plugin } from 'vite';
import { content } from './src/content.ts';
import { metaTags } from './src/meta.ts';

const htmlMetaPlugin: Plugin = {
  name: 'html-meta',
  transformIndexHtml() {
    return metaTags(content);
  },
};

export default defineConfig({
  base: process.env.VITE_BASE ?? '/invite-app/',
  plugins: [htmlMetaPlugin],
  build: {
    rollupOptions: {
      input: ['index.html', 'imprimir.html'],
    },
  },
});
