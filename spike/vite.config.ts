import path from 'node:path';
import { defineConfig } from 'vite';

/**
 * 手動開 spike 量測頁用（例如拿實機連進來看）：
 * npx vite --config spike/vite.config.ts --host
 * 不沿用 app 的 vite.config，因為 vite-plugin-html 會把 HTML 請求導回 app 首頁。
 */
export default defineConfig({
  root: path.join(import.meta.dirname, '..'),
  appType: 'mpa',
  optimizeDeps: { entries: ['spike/*/index.html'] },
  server: { port: 5197, strictPort: true },
});
