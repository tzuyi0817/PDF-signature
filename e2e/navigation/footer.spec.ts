import { expect, test } from '@playwright/test';

test.describe('footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display correct layout', async ({ page }) => {
    await expect(page.getByRole('img', { name: /background decorate/i })).toBeInViewport();
  });
});
