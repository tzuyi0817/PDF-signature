/**
 * Spike #135 區塊 4：產生 20 頁文件，量三種預覽策略在桌機與手機模擬下的渲染時間。
 * 執行：node spike/preview/measure.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import type { PreviewResult } from './main.ts';

const PORT = 5198;
const PAGE_COUNT = 20;
const RUNS = 3;
const OUT_DIR = path.join(import.meta.dirname, '..', 'pdf-lib', 'out');
/** 計畫停點定的門檻：首頁 ≤ 1.5 秒、之後每頁 ≤ 500ms */
const FIRST_PAGE_LIMIT = 1500;
const PER_PAGE_LIMIT = 500;
const STRATEGIES = ['png', 'pdfjs', 'pdf-canvas'] as const;
const PROFILES = [
  { name: 'desktop', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, cpuThrottle: 1 },
  { name: 'mobile-4x', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, cpuThrottle: 4, isMobile: true },
];
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

/** 產生文字為主、帶少量向量圖形的 20 頁 A4 文件 */
async function createDocument() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (let index = 0; index < PAGE_COUNT; index++) {
    const page = pdf.addPage([595.28, 841.89]);

    page.drawText(`Contract page ${index + 1}`, { x: 50, y: 790, size: 18, font });
    page.drawRectangle({ x: 50, y: 60, width: 495, height: 70, borderColor: rgb(0.4, 0.4, 0.4), borderWidth: 1 });

    for (let line = 0; line < 44; line++) {
      page.drawText(`${line + 1}. ${LOREM}`.slice(0, 96), { x: 50, y: 760 - line * 14, size: 10, font });
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, `preview-${PAGE_COUNT}.pdf`), await pdf.save());
}

function median(values: number[]) {
  const sorted = values.toSorted((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

await createDocument();

const server = await createServer({
  configFile: false,
  root: path.join(import.meta.dirname, '..', '..'),
  appType: 'mpa',
  optimizeDeps: { entries: ['spike/preview/index.html'] },
  server: { port: PORT, strictPort: true },
  logLevel: 'error',
});

await server.listen();

const browser = await chromium.launch();
let isAcceptable = true;

try {
  for (const { name, cpuThrottle, ...contextOptions } of PROFILES) {
    for (const strategy of STRATEGIES) {
      const results: Exclude<PreviewResult, { error: string }>[] = [];

      // 多跑一次暖機，不列入統計
      for (let run = 0; run <= RUNS; run++) {
        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();
        const session = await context.newCDPSession(page);
        const resultElement = page.locator('#spike-result');

        // 只節流頁面主執行緒；pdf.js 的 worker 是另一個 target，不受影響
        await session.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
        await page.goto(`http://localhost:${PORT}/spike/preview/index.html?strategy=${strategy}`);
        await resultElement.waitFor({ state: 'attached', timeout: 180_000 });

        const result: PreviewResult = JSON.parse((await resultElement.textContent()) ?? '{"error":"empty result"}');

        await context.close();

        if ('error' in result) throw new Error(`[${name}] ${strategy}: ${result.error}`);
        if (run > 0) results.push(result);
      }

      const firstPage = median(results.map(result => result.firstPage));
      const allPages = median(results.map(result => result.allPages));
      const slowestPage = median(results.map(result => result.slowestPage));
      const [sample] = results;
      const pass = strategy === 'png' || (firstPage <= FIRST_PAGE_LIMIT && slowestPage <= PER_PAGE_LIMIT);

      const verdict = pass ? 'PASS' : 'FAIL';
      const label = strategy === 'png' ? 'BASE' : verdict;

      isAcceptable &&= pass;
      console.info(
        `${label}  [${name}] ${strategy.padEnd(10)} 首頁 ${firstPage.toFixed(0)} ms｜${sample?.pages} 頁共 ${allPages.toFixed(0)} ms｜最慢單頁 ${slowestPage.toFixed(0)} ms｜畫布寬 ${sample?.pixelWidth} px｜canvas 記憶體 ${sample?.canvasMemory.toFixed(0)} MB`,
      );
    }
  }
} finally {
  await browser.close();
  await server.close();
}

process.exitCode = isAcceptable ? 0 : 1;
