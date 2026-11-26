import { readFile } from 'node:fs/promises';
import { expect, test, type Download, type Page } from '@playwright/test';
import { inspectPdf } from '@/utils/pdf-export/testing/inspect';
import { PAGE_TEXTS } from '@/utils/pdf-export/testing/source';
import {
  createMockFiles,
  createMockSignedFile,
  measureExportSizes,
  MOCK_BROKEN_FILE,
  MOCK_FILES,
  MOCK_SIGNED_FILE,
  STORED_BLOB,
} from '../mocks/file';

const PDF_JS_WORKER_SKIP =
  'Playwright >= 1.61.0 Firefox regression: WebSocket inside a worker crashes the page session';

async function openEncryptPopup(page: Page, name: string) {
  await page
    .locator(`li:has-text("${name}")`)
    .getByTitle(/#icon-ic_download/i)
    .click();
}

async function download(page: Page, button: RegExp): Promise<Download> {
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: button }).click()]);

  return file;
}

async function readDownload(file: Download) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- 路徑是 Playwright 存放下載檔的暫存位置
  return new Uint8Array(await readFile(await file.path()));
}

test.describe('download', STORED_BLOB, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test.describe('document that keeps its original', () => {
    test.beforeEach(async ({ page }) => {
      await createMockSignedFile(page);
    });

    test('overlays the signature on the original and keeps the text', async ({ page }) => {
      await openEncryptPopup(page, MOCK_SIGNED_FILE.name);

      const file = await download(page, /not yet/i);
      const pages = await inspectPdf(await readDownload(file));

      expect(file.suggestedFilename()).toBe(`${MOCK_SIGNED_FILE.name}.pdf`);
      expect(pages.map(({ text }) => text)).toEqual(PAGE_TEXTS);
      expect(pages.map(({ images }) => images.length)).toEqual([1, 0, 0, 0, 0, 0, 0]);
      await expect(page.getByRole('heading', { name: /download/i })).toBeHidden();
    });

    test('encrypts the output with the given password', async ({ page }) => {
      const secret = '123456';

      await openEncryptPopup(page, MOCK_SIGNED_FILE.name);
      await page.getByPlaceholder('Please enter password', { exact: true }).fill(secret);
      await page.getByPlaceholder(/please enter password again/i).fill(secret);

      const bytes = await readDownload(await download(page, /confirm/i));
      const pages = await inspectPdf(bytes, secret);

      await expect(inspectPdf(bytes)).rejects.toThrow('No password given');
      expect(pages.map(({ text }) => text)).toEqual(PAGE_TEXTS);
    });

    test('is not larger than the raster export of the same document', async ({ page, browserName }) => {
      // 轉圖會在頁面內啟動 pdf.js worker（Firefox 見下方說明）；大小比較與瀏覽器無關，一個引擎就夠
      test.skip(browserName !== 'chromium', 'Size comparison renders with pdf.js; one engine is enough');

      const sizes = await measureExportSizes(page, MOCK_SIGNED_FILE.PDFId);

      expect(sizes.overlaid).toBeGreaterThan(0);
      expect(sizes.overlaid).toBeLessThanOrEqual(sizes.raster);
    });
  });

  test('document saved before the storage change still downloads', async ({ page }) => {
    const [legacy] = MOCK_FILES;

    await createMockFiles(page);
    await openEncryptPopup(page, legacy.name);

    const file = await download(page, /not yet/i);
    const pages = await inspectPdf(await readDownload(file));

    expect(file.suggestedFilename()).toBe(`${legacy.name}.pdf`);
    expect(pages.map(({ images }) => images.length)).toEqual(Array.from({ length: legacy.pages }, () => 1));
  });

  test('shows an error when the original cannot be rendered either', async ({ page, browserName }) => {
    // 轉圖退路會啟動 pdf.js worker，觸發 files.spec.ts 記錄的 Playwright Firefox regression（microsoft/playwright#41742）
    test.skip(browserName === 'firefox', PDF_JS_WORKER_SKIP);

    await createMockSignedFile(page, MOCK_BROKEN_FILE, new TextEncoder().encode('not a pdf'));
    await openEncryptPopup(page, MOCK_BROKEN_FILE.name);
    await page.getByRole('button', { name: /not yet/i }).click();

    await expect(page.getByText(/file download failed/i)).toBeVisible();
    await expect(page.getByText(/file downloading/i)).toBeHidden();
  });
});
