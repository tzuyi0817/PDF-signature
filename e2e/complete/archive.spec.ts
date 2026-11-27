import { expect, test } from '@playwright/test';
import { IDB_KEY } from '@/constants/idb';
import { readStoredList, setMockCurrentPDF, STORED_BLOB } from '../mocks/file';

test.describe('complete page archive and trash after re-editing', { tag: [STORED_BLOB] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setMockCurrentPDF(page, 'edited');
    await page.goto('/complete', { waitUntil: 'domcontentloaded' });
  });

  for (const [icon, key] of [
    ['archive', IDB_KEY.ARCHIVE_LIST],
    ['trash', IDB_KEY.TRASH_LIST],
  ] as const) {
    test(`${icon} stores the document without the editing background`, async ({ page }) => {
      await page.getByTitle(`#icon-ic_${icon}`, { exact: true }).click();
      await page.getByRole('button', { name: /confirm/i }).click();

      await expect.poll(() => readStoredList(page, key)).toEqual([{ hasData: true, hasBackground: false }]);
    });
  }
});
