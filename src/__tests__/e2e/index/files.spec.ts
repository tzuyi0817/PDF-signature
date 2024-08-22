import { test, expect } from '@playwright/test';
import { createMockFiles, MOCK_FILES } from '@/__tests__/__mocks__/file';
import { transformTimestamp } from '@/utils/common';

test.describe('files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

      expect(await elements.count()).toBe(MOCK_FILES.length);

      for (const file of MOCK_FILES) {
        await expect(page.getByText(file.name)).toBeInViewport();
        await expect(page.getByText(transformTimestamp(file.updateDate))).toBeInViewport();
      }
    });

    test('search files', async ({ page }) => {
      const searchbar = page.getByPlaceholder(/please enter keywords/i);

      await expect(page.getByTitle(/search icon/i)).toBeInViewport();
      await expect(searchbar).toBeInViewport();

      const searchIndex = 0;
      const { name } = MOCK_FILES[searchIndex];
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
      await expect(page.getByText(/project name/i)).not.toBeInViewport();
      await expect(page.getByTitle(/list icon/i)).not.toBeInViewport();
    });

    test.describe('download file feature', () => {
      const { name } = MOCK_FILES[0];

      test.beforeEach(async ({ page }) => {
        const li = page.locator(`li:has-text("${name}")`);

        await li.getByTitle(/#icon-ic_download/i).click();
      });

      test('show encryption popup', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /encryption/i })).toBeInViewport();
        await expect(page.getByText(/set a password to protect your pdf file/i)).toBeInViewport();
        await expect(page.getByPlaceholder('Please enter password', { exact: true })).toBeInViewport();
        await expect(page.getByPlaceholder(/please enter password again/i, { exact: true })).toBeInViewport();
      });

      test('download file', async ({ page }) => {
        await page.getByRole('button', { name: /not yet/i }).click();

        const download = await page.waitForEvent('download');
        const regex = new RegExp(`${name}\\.pdf`);

        expect(download.suggestedFilename()).toMatch(regex);
      });

      test.describe('download file with encryption', () => {
        const passwordPlaceholder = 'Please enter password';

        test('click the eye icon to show password', async ({ page }) => {
          const password = '123456';
          const passwordInput = page.getByPlaceholder(passwordPlaceholder, { exact: true });
          const passwordConfirmInput = page.getByPlaceholder(/please enter password again/i, { exact: true });

          await passwordInput.fill(password);
          await passwordConfirmInput.fill(password);

          const icons = await page.getByTitle(/#icon-ic_eye_closed/i).all();

          icons.reverse();
          expect(icons.length).toBe(2);

          for (const icon of icons) {
            await icon.click();
          }
          await expect(passwordInput).toHaveAttribute('type', 'text');
          await expect(passwordConfirmInput).toHaveAttribute('type', 'text');
        });

        test('without password', async ({ page }) => {
          await page.getByRole('button', { name: /confirm/i }).click();
          await expect(page.getByText(/password is required/i)).toBeInViewport();
        });

        test('with inconsistent password', async ({ page }) => {
          await page.getByPlaceholder(passwordPlaceholder, { exact: true }).fill('123456');
          await page.getByPlaceholder(/please enter password again/i, { exact: true }).fill('123');
          await page.getByRole('button', { name: /confirm/i }).click();
          await expect(page.getByText(/passwords are inconsistent/i)).toBeInViewport();
        });

        test('with correct password', async ({ page }) => {
          const password = '123456';

          await page.getByPlaceholder(passwordPlaceholder, { exact: true }).fill(password);
          await page.getByPlaceholder(/please enter password again/i, { exact: true }).fill(password);
          await page.getByRole('button', { name: /confirm/i }).click();

          const download = await page.waitForEvent('download');
          const regex = new RegExp(`${name}\\.pdf`);

          expect(download.suggestedFilename()).toMatch(regex);
        });
      });
    });

    test('click on the sign icon to redirect to signature page', async ({ page }) => {
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
