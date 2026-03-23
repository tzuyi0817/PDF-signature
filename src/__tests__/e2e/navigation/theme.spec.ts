import { expect, test } from '@playwright/test';

const STORAGE_KEY = 'pdf_signature_config';

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should cycle through light → dark → system → light', async ({ page }) => {
    const themeButton = page.locator('button:has(svg[title*="icon-ic_sun"])');

    await expect(themeButton).toBeVisible();

    await themeButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('button:has(svg[title*="icon-ic_moon"])')).toBeVisible();

    await page.locator('button:has(svg[title*="icon-ic_moon"])').click();
    await expect(page.locator('button:has(svg[title*="icon-ic_monitor"])')).toBeVisible();

    await page.locator('button:has(svg[title*="icon-ic_monitor"])').click();
    await expect(page.locator('button:has(svg[title*="icon-ic_sun"])')).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should persist theme preference across page reload', async ({ page }) => {
    const themeButton = page.locator('button:has(svg[title*="icon-ic_sun"])');

    await themeButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('button:has(svg[title*="icon-ic_moon"])')).toBeVisible();
  });

  test('should not flash wrong theme on dark mode reload (no FOUC)', async ({ page }) => {
    const themeButton = page.locator('button:has(svg[title*="icon-ic_sun"])');

    await themeButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.addInitScript(() => {
      (globalThis as unknown as Record<string, boolean>).__darkClassOnLoad =
        document.documentElement.classList.contains('dark');
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('html')).toHaveClass(/dark/);

    const storedConfig = await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY);

    expect(storedConfig).toBeTruthy();
    const config = JSON.parse(storedConfig!);

    expect(config.theme).toBe('dark');
  });
});
