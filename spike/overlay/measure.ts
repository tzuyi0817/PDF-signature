/**
 * Spike #135 區塊 3：啟動 Vite、用 Chromium 開量測頁，印出每頁的對位誤差。
 * 執行：node spike/overlay/measure.ts
 * 需先跑過 spike/pdf-lib/verify-basic.ts 產生來源 PDF。
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import type { SpikeResult } from './main.ts';

const PORT = 5199;
const TOLERANCE_PT = 1;
const OUT_DIR = path.join(import.meta.dirname, '..', 'pdf-lib', 'out');
/** 桌機、Retina、手機三種像素密度，pdf-canvas 的渲染倍率會跟著變 */
const PROFILES = [
  { name: 'desktop-dpr1', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  { name: 'desktop-dpr2', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 },
  { name: 'mobile-dpr3', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 },
];

// 不載入 app 的 vite.config：vite-plugin-html 會把所有 HTML 請求導回 app 的 index.html
const server = await createServer({
  configFile: false,
  root: path.join(import.meta.dirname, '..', '..'),
  appType: 'mpa',
  optimizeDeps: { entries: ['spike/overlay/index.html'] },
  server: { port: PORT, strictPort: true },
  logLevel: 'error',
});

await server.listen();

const browser = await chromium.launch();
let isAllWithinTolerance = true;

try {
  for (const { name, ...contextOptions } of PROFILES) {
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    page.on('pageerror', error => console.info(`[${name}] pageerror: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') console.info(`[${name}] console: ${message.text()}`);
    });
    page.on('requestfailed', request => console.info(`[${name}] requestfailed: ${request.url()}`));

    await page.goto(`http://localhost:${PORT}/spike/overlay/index.html`);
    const resultElement = page.locator('#spike-result');

    await resultElement.waitFor({ state: 'attached', timeout: 120_000 });

    const result: SpikeResult = JSON.parse((await resultElement.textContent()) ?? '{"error":"empty result"}');

    await context.close();

    if ('error' in result) {
      isAllWithinTolerance = false;
      console.info(`FAIL  [${name}] ${result.error}`);
      continue;
    }

    writeFileSync(path.join(OUT_DIR, `overlay-${name}.pdf`), new Uint8Array(result.pdf));

    for (const row of result.rows) {
      const pass = row.maxError <= TOLERANCE_PT;

      isAllWithinTolerance &&= pass;
      console.info(
        `${pass ? 'PASS' : 'FAIL'}  [${name}] 第 ${row.page} 頁（${row.viewSize} pt，overlay ${row.overlayPx} px）最大誤差 ${row.maxError.toFixed(3)} pt`,
      );
    }
  }
} finally {
  await browser.close();
  await server.close();
}

process.exitCode = isAllWithinTolerance ? 0 : 1;
