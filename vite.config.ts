import { fileURLToPath, URL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, splitVendorChunkPlugin, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import vueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
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
    VitePWA({ registerType: 'autoUpdate' }),
    splitVendorChunkPlugin(),
    visualizer({ gzipSize: true }) as unknown as Plugin<any>,
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
        chunkFileNames: 'chunks/[name]-[hash].js',
        manualChunks: filepath => {
          if (filepath.includes('@component-hook/pdf-canvas')) {
            return '@component-hook/pdf-canvas';
          }
        },
      },
    },
  },
});
