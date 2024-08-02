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
    });
  });
});
