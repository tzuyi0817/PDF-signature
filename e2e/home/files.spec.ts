import { expect, test } from '@playwright/test';
import { transformTimestamp } from '@/utils/common';
import { createMockFiles, MOCK_FILES } from '../mocks/file';

test.describe('files', () => {
  test.beforeEach(async ({ page }) => {
    // Simply wait for the `DOMContentLoaded` event.
    // this prevents slow static assets from blocking the `load` event and causing timeouts during parallel testing.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should display correct layout', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /my files/i })).toBeInViewport();
    await expect(page.getByRole('img', { name: /create file/i })).toBeInViewport();
    await expect(page.getByRole('heading', { name: /come and create a new file/i })).toBeInViewport();
  });

  test('click create file button should navigate to upload page', async ({ page }) => {
    await page.getByRole('img', { name: /create file/i }).click();
    await page.waitForURL('http://localhost:8081/upload');

    expect(page.url()).toBe('http://localhost:8081/upload');
  });

  test.describe('when there are files', () => {
    test.beforeEach(async ({ page }) => {
      await createMockFiles(page);
    });

    test('should display files', async ({ page }) => {
      await expect(page.getByRole('img', { name: /create file/i })).not.toBeInViewport();
      await expect(page.getByRole('heading', { name: /come and create a new file/i })).not.toBeInViewport();
      await expect(page.getByText(/setup time/i)).toBeInViewport();
      await expect(page.getByText(/project name/i)).toBeInViewport();
      await expect(page.getByTitle(/#icon-ic_list/i)).toBeInViewport();
      await expect(page.getByTitle(/#icon-ic_list/i)).toHaveClass(/text-primary/g);
      await expect(page.getByTitle(/#icon-ic_card/i)).toBeInViewport();

      const elements = page.getByTitle(/list icon/i);

      await expect(elements).toHaveCount(MOCK_FILES.length);

      for (const file of MOCK_FILES) {
        await expect(page.getByText(file.name)).toBeInViewport();
        await expect(page.getByText(transformTimestamp(file.updateDate))).toBeInViewport();
      }
    });

    test('search files', async ({ page }) => {
      const searchbar = page.getByPlaceholder(/please enter keywords/i);

      await expect(page.getByTitle(/search icon/i)).toBeInViewport();
      await expect(searchbar).toBeInViewport();

      const { name } = MOCK_FILES[0];
      const searchValue = name.slice(0, 2);

      await searchbar.fill(searchValue);
      await expect(page.getByText(name)).toBeInViewport();
      await expect(page.getByText(MOCK_FILES[1].name)).not.toBeInViewport();
    });

    test('change to card mode', async ({ page }) => {
      const cardIcon = page.getByTitle(/#icon-ic_card/i);

      await cardIcon.click();
      await expect(cardIcon).toHaveClass(/text-primary/g);
      await expect(page.getByText(/setup time/i)).not.toBeInViewport();
      await expect(page.getByText(/project name/i)).toHaveClass(/opacity-0/);
      await expect(page.getByTitle(/list icon/i)).not.toBeInViewport();
    });

    test.describe('download file feature', () => {
      const secretPlaceholder = 'Please enter password';

      test('show encryption popup', async ({ page }) => {
        const { name } = MOCK_FILES[0];
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();
        await expect(page.getByRole('heading', { name: /encryption/i })).toBeInViewport();
        await expect(page.getByText(/set a password to protect your pdf file/i)).toBeInViewport();
        await expect(page.getByPlaceholder('Please enter password', { exact: true })).toBeInViewport();
        await expect(page.getByPlaceholder(/please enter password again/i, { exact: true })).toBeInViewport();
      });

      test('download file', async ({ page }) => {
        const { name } = MOCK_FILES[0];
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();

        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.getByRole('button', { name: /not yet/i }).click(),
        ]);

        expect(download.suggestedFilename()).toMatch(`${name}.pdf`);
      });

      test('click the eye icon to show password', async ({ page }) => {
        const { name } = MOCK_FILES[0];
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();

        const secret = '123456';
        const secretInput = page.getByPlaceholder(secretPlaceholder, { exact: true });
        const secretConfirmInput = page.getByPlaceholder(/please enter password again/i, { exact: true });

        await secretInput.fill(secret);
        await secretConfirmInput.fill(secret);

        const iconLocator = page.getByTitle(/#icon-ic_eye_closed/i);
        const count = 2;

        await expect(iconLocator).toHaveCount(count);

        for (let index = count - 1; index >= 0; index--) {
          await iconLocator.nth(index).click();
        }

        await expect(secretInput).toHaveAttribute('type', 'text');
        await expect(secretConfirmInput).toHaveAttribute('type', 'text');
      });

      test('without password', async ({ page }) => {
        const { name } = MOCK_FILES[0];
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();
        await page.getByRole('button', { name: /confirm/i }).click();
        await expect(page.getByText(/password is required/i)).toBeInViewport();
      });

      test('with inconsistent password', async ({ page }) => {
        const { name } = MOCK_FILES[0];
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();
        await page.getByPlaceholder(secretPlaceholder, { exact: true }).fill('123456');
        await page.getByPlaceholder(/please enter password again/i, { exact: true }).fill('123');
        await page.getByRole('button', { name: /confirm/i }).click();
        await expect(page.getByText(/passwords are inconsistent/i)).toBeInViewport();
      });

      test('with correct password', async ({ page }) => {
        const secret = '123456';
        const { name } = MOCK_FILES[1];
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();
        await page.getByPlaceholder(secretPlaceholder, { exact: true }).fill(secret);
        await page.getByPlaceholder(/please enter password again/i, { exact: true }).fill(secret);

        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.getByRole('button', { name: /confirm/i }).click(),
        ]);

        expect(download.suggestedFilename()).toMatch(`${name}.pdf`);
      });
    });

    test('click on the sign icon to redirect to signature page', async ({ page, browserName }) => {
      // Playwright >= 1.61.0 regression: a WebSocket opened inside a Web Worker kills the Firefox
      // page session with a bare "Error: Assertion error" (ffPage `_onWebSocketOpened` asserts on a
      // request it never tracked). The signing flow triggers it because pdf.js spawns a worker whose
      // script is served by the Vite dev server, which injects the HMR client (`/@vite/client`), and
      // that client opens its HMR WebSocket inside the worker. Chromium/WebKit and real Firefox are
      // unaffected; 1.59.1/1.60.0 pass, 1.61.x and 1.62.0-alpha fail. Minimal repro: https://github.com/microsoft/playwright/issues/41742.
      // Remove this skip once the upstream regression is fixed.
      test.skip(
        browserName === 'firefox',
        'Playwright >= 1.61.0 Firefox regression: WebSocket inside a worker crashes the page session',
      );

      const { name } = MOCK_FILES[0];
      const li = page.locator(`li:has-text("${name}")`);

      await li.getByTitle(/#icon-ic_sign/i).click();
      await page.waitForURL('http://localhost:8081/signature');

      expect(page.url()).toBe('http://localhost:8081/signature');
    });

    test('click on the archive icon to move file to archive', async ({ page }) => {
      const { name } = MOCK_FILES[0];
      const li = page.locator(`li:has-text("${name}")`);

      await li.getByTitle(/#icon-ic_archive/i).click();
      await expect(li).not.toBeInViewport();
      await page.locator('li:has(img[alt="archive icon"])').click();
      await expect(page.getByText(name)).toBeInViewport();
    });

    test('click on the trash icon to move file to trash', async ({ page }) => {
      const { name } = MOCK_FILES[0];
      const li = page.locator(`li:has-text("${name}")`);

      await li.getByTitle(/#icon-ic_trash/i).click();
      await expect(li).not.toBeInViewport();
      await page.locator('li:has(img[alt="trash icon"])').click();
      await expect(page.getByText(name)).toBeInViewport();
    });
  });
});
