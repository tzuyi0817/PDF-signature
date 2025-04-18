import { expect, test, type Page } from '@playwright/test';

test.describe('menu', () => {
  const getShared = (page: Page) => {
    return {
      file: page.locator('li:has(img[alt="file icon"])'),
      archive: page.locator('li:has(img[alt="archive icon"])'),
      trash: page.locator('li:has(img[alt="trash icon"])'),
    };
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display correct layout', async ({ page }) => {
    const shared = getShared(page);

    await expect(shared.file).toBeInViewport();
    await expect(shared.archive).toBeInViewport();
    await expect(shared.trash).toBeInViewport();
  });

  test('active menu item should be highlighted', async ({ page }) => {
    const shared = getShared(page);

    await expect(shared.file).toHaveClass('bg-white');
    await expect(page.getByRole('heading', { name: /my files/i })).toBeVisible();

    await shared.archive.click();
    await expect(shared.file).not.toHaveClass('bg-white');
    await expect(shared.archive).toHaveClass('bg-white');
    await expect(page.getByRole('heading', { name: /archived files/i })).toBeVisible();

    await shared.trash.click();
    await expect(shared.archive).not.toHaveClass('bg-white');
    await expect(shared.trash).toHaveClass('bg-white');
    await expect(page.getByRole('heading', { name: /trash bin/i })).toBeVisible();
  });
});
