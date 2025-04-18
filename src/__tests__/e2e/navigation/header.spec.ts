import { expect, test } from '@playwright/test';
import { I18N_MAP } from '@/constants/common';
import { sleep } from '@/utils/common';

test.describe('header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display correct layout', async ({ page }) => {
    await expect(page.getByRole('link', { name: /logo/i })).toBeInViewport();
    await expect(page.getByTitle(/#icon-ic_global/i)).toBeInViewport();
    await expect(page.locator('a:has(svg[title="#icon-ic_github"])')).toBeInViewport();
  });

  test('click logo should be navigate to the home page', async ({ page }) => {
    await page.goto('/upload');
    await page.getByRole('link', { name: /logo/i }).click();
    await page.waitForURL('http://localhost:8081/');

    expect(page.url()).toBe('http://localhost:8081/');
  });

  test('should display correct language list', async ({ page }) => {
    const languages = Object.values(I18N_MAP);

    await page.getByTitle(/#icon-ic_global/i).hover();

    for (const language of languages) {
      await expect(page.getByText(language)).toBeVisible();
    }
  });

  test('should change the language', async ({ page }) => {
    const globalIcon = page.getByTitle(/#icon-ic_global/i);

    await globalIcon.hover();
    await page.getByText(/繁體中文/).click();
    await expect(page.getByText('我的文件')).toBeVisible();
    await sleep();
    await globalIcon.hover();
    await page.getByText(/日本語/).click();
    await expect(page.getByText('私のファイル')).toBeVisible();
  });

  test('click github link should be redirected to the github page', async ({ page, context }) => {
    const link = page.locator('a:has(svg[title="#icon-ic_github"])');

    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('target', '_blank');
    await link.click();

    const newPage = await context.waitForEvent('page');

    await newPage.waitForLoadState();

    expect(newPage.url()).toBe('https://github.com/tzuyi0817/PDF-signature');
  });
});
