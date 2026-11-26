import { expect, test } from '@playwright/test';
import { IDB_KEY } from '@/constants/idb';
import { createPng } from '@/utils/pdf-export/testing/png';
import { readStoredPassword, setFilePassword } from '../mocks/file';

test('a password left over from an earlier upload is not stored on the next file', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await setFilePassword(page, 'stale-password');
  await page.getByRole('img', { name: /create file/i }).click();
  await page.waitForURL('http://localhost:8081/upload');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(createPng(60, 40)),
  });

  await expect(page.getByText(/file uploaded successfully/i)).toBeVisible();
  await expect.poll(() => readStoredPassword(page, IDB_KEY.CURRENT_PDF)).toBeUndefined();
});
