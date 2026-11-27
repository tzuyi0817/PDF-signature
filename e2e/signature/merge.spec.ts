import { expect, test, type Page } from '@playwright/test';
import { IDB_KEY } from '@/constants/idb';
import { createMockSignedFile, MOCK_SIGNED_FILE, readStoredOverlayCount, STORED_BLOB } from '../mocks/file';

const LITERAL = 'E2E signature';

function failNthWrite(page: Page, nth: number) {
  return page.evaluate(target => {
    const { put } = IDBObjectStore.prototype;
    let count = 0;

    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
      count += 1;
      if (count < target) return put.apply(this, args);

      IDBObjectStore.prototype.put = put;
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  }, nth);
}

function holdNextListWrite(page: Page, key: string) {
  return page.evaluate(listKey => {
    const { put } = IDBObjectStore.prototype;

    IDBObjectStore.prototype.put = function (value: unknown, storeKey?: IDBValidKey) {
      if (storeKey !== listKey) return put.call(this, value, storeKey);

      IDBObjectStore.prototype.put = put;
      console.info('list-write-held');

      const spin = (request: IDBRequest) => {
        request.onsuccess = () => {
          if (sessionStorage.getItem('list-write') === 'released') {
            put.call(this, value, storeKey);
          } else {
            spin(this.get('__hold'));
          }
        };
      };
      const first = this.get('__hold');

      spin(first);

      return first as unknown as IDBRequest<IDBValidKey>;
    };
  }, key);
}

async function addLiteralSignature(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await popup(page, /signature file/i)
    .getByRole('button', { name: /cancel/i })
    .click();
  await page.locator('.signature-toolbar li', { hasText: /^text$/i }).click();

  const literalPopup = popup(page, /text library/i);

  await literalPopup.getByText(LITERAL).click();
  await literalPopup.getByRole('button', { name: /^use$/i }).click();
}

function popup(page: Page, title: RegExp) {
  return page.locator('.signature-popup', { has: page.getByRole('heading', { name: title }) });
}

test.describe('signature merge', { tag: [STORED_BLOB] }, () => {
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.addInitScript(text => {
      localStorage.setItem('pdf_signature_literal', JSON.stringify({ literalList: [text] }));
    }, LITERAL);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await createMockSignedFile(page);
    await page
      .locator(`li:has-text("${MOCK_SIGNED_FILE.name}")`)
      .getByTitle(/#icon-ic_sign/i)
      .click();
    await page.waitForURL('http://localhost:8081/signature');
    await expect(page.getByRole('button', { name: /next step/i })).toBeEnabled({ timeout: 30_000 });
  });

  test('keeps the stored document unsigned when saving to the list fails', async ({ page }) => {
    await addLiteralSignature(page);
    await failNthWrite(page, 2);
    await page.getByRole('button', { name: /next step/i }).click();
    await page.getByRole('button', { name: /^confirm$/i }).click();

    await expect(page.getByText(/operation timed out/i)).toBeVisible();
    expect(await readStoredOverlayCount(page, IDB_KEY.CURRENT_PDF)).toBe(1);
  });

  test('stays on the page the user went back to while the merge is saving', async ({ page }) => {
    await addLiteralSignature(page);
    await holdNextListWrite(page, IDB_KEY.PDF_LIST);
    await page.getByRole('button', { name: /next step/i }).click();

    const held = page.waitForEvent('console', message => message.text() === 'list-write-held');

    await page.getByRole('button', { name: /^confirm$/i }).click();
    await held;

    await page.goBack();
    await page.waitForURL('http://localhost:8081/');
    await page.evaluate(() => sessionStorage.setItem('list-write', 'released'));

    await expect(page.getByText(/file created successfully/i)).toBeVisible();

    const isNavigated = await page.waitForURL(/\/complete$/, { timeout: 3000 }).then(
      () => true,
      () => false,
    );

    expect(isNavigated).toBe(false);
  });
});
