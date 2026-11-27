import { expect, test, type Page } from '@playwright/test';
import { createPng } from '@/utils/pdf-export/testing/png';
import { STORED_BLOB } from '../mocks/file';

async function openUploadPage(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('img', { name: /create file/i }).click();
  await page.waitForURL('http://localhost:8081/upload');
}

function failNextWrite(page: Page, times = 1) {
  return page.evaluate(count => {
    const { put } = IDBObjectStore.prototype;
    let remaining = count;

    IDBObjectStore.prototype.put = function () {
      remaining -= 1;
      if (remaining === 0) IDBObjectStore.prototype.put = put;
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  }, times);
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
    await failNextWrite(page);
    await uploadPng(page);

    await expect(page.getByText(/file upload failed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /next step/i })).toBeDisabled();
  });

  test('stays on the upload page when the project name cannot be saved', async ({ page }) => {
    await openUploadPage(page);
    await uploadPng(page);
    await page.locator('input[type="text"]').fill('Contract-final');
    await failNextWrite(page, 2);
    await page.getByRole('button', { name: /next step/i }).click();

    await expect(page.getByText(/operation timed out/i)).toHaveCount(2);
    expect(page.url()).toBe('http://localhost:8081/upload');
  });
});
