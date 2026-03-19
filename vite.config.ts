import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import topLevelAwait from 'vite-plugin-top-level-await';
import packageJson from './package.json' with { type: 'json' };

process.env.VITE_APP_VERSION = packageJson.version;

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icon')],
    }),
    vueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), 'src/locales/**'),
    }),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (index: number) => `__tla_${index}`,
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        ejsOptions: {
          views: ['./.ejs/'],
        },
      },
    }),
    VitePWA({ registerType: 'autoUpdate' }),
    visualizer({ gzipSize: true, open: true }),
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
  build: {
    rolldownOptions: {
      output: {
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        entryFileNames: 'entries/[name].[hash].js',
        codeSplitting: {
          groups: [
            {
              name: 'core',
              test: /node_modules[\\/](vue|pinia)/,
              priority: 20,
            },
            {
              name: 'vender',
              test: /node_modules[\\/](browser-image-compression|idb-keyval)|@intlify\/unplugin-vue-i18n\/messages/,
              priority: 15,
            },
            {
              name: 'pdf-canvas',
              test: /node_modules[\\/]@component-hook[\\/]pdf-canvas/,
              priority: 10,
            },
            {
              name: 'jspdf',
              test: /node_modules[\\/]jspdf/,
              priority: 5,
            },
          ],
        },
      },
    },
  },
});
