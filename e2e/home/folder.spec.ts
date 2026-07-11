import { expect, test, type Page } from '@playwright/test';
import { createMockFileInFolder, createMockFiles, MOCK_FILES, MOCK_FOLDER_FILE } from '../mocks/file';
import { createMockFolder } from '../mocks/folder';

/** 等待首頁檔案列表渲染完成 */
async function waitForFiles(page: Page) {
  await page.locator('li.sign-file').first().waitFor({ state: 'visible', timeout: 10_000 });
}

test.describe('folder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('folder CRUD', () => {
    test('should create a new folder via dialog', async ({ page }) => {
      await createMockFiles(page);
      await waitForFiles(page);

      const newFolderIcon = page.locator('svg[title*="folder_new"]');

      await newFolderIcon.click();
      await expect(page.getByText(/create folder/i)).toBeInViewport();

      const input = page.getByPlaceholder(/enter folder name/i);

      await input.fill('Test Folder');
      await page.getByRole('button', { name: /confirm/i }).click();

      await expect(page.getByText('Test Folder')).toBeInViewport();
    });

    test('should show folder in list before files', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'My Documents');
      await waitForFiles(page);

      const folderItem = page.getByText('My Documents');

      await expect(folderItem).toBeInViewport();
    });

    test('should delete a folder', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Delete Me');
      await waitForFiles(page);

      const folderItem = page.locator('.folder-row:has-text("Delete Me")');

      await folderItem.locator('svg[title*="trash"]').click();
      await page.getByRole('button', { name: /confirm/i }).click();
      await expect(page.getByText('Delete Me')).toBeHidden();
    });

    test('should move files inside deleted folder to trash', async ({ page }) => {
      await createMockFiles(page);

      const folder = await createMockFolder(page, 'Folder With File');

      await createMockFileInFolder(page, MOCK_FOLDER_FILE, folder.folderId);
      await waitForFiles(page);

      // 檔案位於資料夾內，不應出現在根目錄
      await expect(page.getByText(MOCK_FOLDER_FILE.name)).toBeHidden();

      const folderItem = page.locator('.folder-row:has-text("Folder With File")');

      await folderItem.locator('svg[title*="trash"]').click();
      await page.getByRole('button', { name: /confirm/i }).click();
      await expect(folderItem).toBeHidden();

      // 刪除資料夾後，檔案不應被移回根目錄
      await expect(page.getByText(MOCK_FOLDER_FILE.name)).toBeHidden();

      // 檔案應出現在垃圾桶
      await page.locator('li:has(img[alt="trash icon"])').click();
      await expect(page.getByText(MOCK_FOLDER_FILE.name)).toBeInViewport();
    });
  });

  test.describe('folder navigation', () => {
    test('should navigate into folder and show breadcrumb', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Work Files');
      await waitForFiles(page);

      const folderItem = page.locator('.folder-row:has-text("Work Files")');

      await folderItem.click();

      await expect(page.getByRole('button', { name: /all files/i })).toBeInViewport();
      await expect(page.getByText('Work Files')).toBeInViewport();
    });

    test('should navigate back to root via breadcrumb', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Navigate Back');
      await waitForFiles(page);

      const folderItem = page.locator('.folder-row:has-text("Navigate Back")');

      await folderItem.click();
      await page.getByRole('button', { name: /all files/i }).click();

      await expect(page.getByText(MOCK_FILES[0].name)).toBeInViewport();
    });
  });

  test.describe('file move operations', () => {
    test('should show move to folder option in file actions', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Target Folder');
      await waitForFiles(page);

      const { name } = MOCK_FILES[0];
      const li = page.locator(`li.sign-file:has-text("${name}")`);

      await expect(li.locator('svg[title*="folder_move"]')).toBeInViewport();
    });

    test('should open move modal when clicking move icon', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Destination');
      await waitForFiles(page);

      const { name } = MOCK_FILES[0];
      const li = page.locator(`li.sign-file:has-text("${name}")`);

      await li.locator('svg[title*="folder_move"]').click();

      const modal = page.locator('.sign-popup');

      await expect(modal.getByText(/move to folder/i)).toBeInViewport();
      await expect(modal.getByText('Destination')).toBeInViewport();
    });
  });
});
