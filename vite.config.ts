import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icon')],
    }),
    vueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), 'src/locales/**'),
    }),
  ],
  server: {
    port: 8080,
  },
  esbuild: {
    pure: ['console.log'],
    drop: ['debugger'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
});
