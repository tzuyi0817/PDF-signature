import { expect, test, type Page } from '@playwright/test';
import { IDB_KEY } from '@/constants/idb';
import { createPng } from '@/utils/pdf-export/testing/png';
import { readStoredPassword, STORED_BLOB } from '../mocks/file';

async function openUploadPage(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('img', { name: /create file/i }).click();
  await page.waitForURL('http://localhost:8081/upload');
}

function failNextWrite(page: Page) {
  return page.evaluate(() => {
    const { put } = IDBObjectStore.prototype;

    IDBObjectStore.prototype.put = function () {
      IDBObjectStore.prototype.put = put;
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
}

function uploadPng(page: Page) {
  return page.locator('input[type="file"]').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(createPng(60, 40)),
  });
}

test.describe('upload write failure', { tag: [STORED_BLOB] }, () => {
  test('shows an error instead of success', async ({ page }) => {
    await openUploadPage(page);
    await failNextWrite(page);
    await uploadPng(page);

    await expect(page.getByText(/file upload failed/i)).toBeVisible();
    await expect(page.getByText(/file uploaded successfully/i)).toBeHidden();
  });

  test('keeps next step disabled after a removed file', async ({ page }) => {
    await openUploadPage(page);
    await uploadPng(page);
    await expect(page.getByRole('button', { name: /next step/i })).toBeEnabled();

    await page.getByTitle(/#icon-ic_close$/).click();
    await expect.poll(() => readStoredPassword(page, IDB_KEY.CURRENT_PDF)).toBeUndefined();
    await failNextWrite(page);
    await uploadPng(page);

    await expect(page.getByText(/file upload failed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /next step/i })).toBeDisabled();
  });
});
