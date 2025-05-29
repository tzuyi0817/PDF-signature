import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type Plugin } from 'vite';
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
    visualizer({ gzipSize: true, open: true }) as unknown as Plugin<any>,
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
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        entryFileNames: 'entries/[name].[hash].js',
        manualChunks: {
          core: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate', 'vue-i18n'],
          vender: ['browser-image-compression', 'idb-keyval', '@intlify/unplugin-vue-i18n/messages'],
          'pdf-canvas': ['@component-hook/pdf-canvas/vue'],
          jspdf: ['jspdf'],
        },
      },
    },
  },
});
