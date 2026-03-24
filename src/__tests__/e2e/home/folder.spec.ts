import { expect, test } from '@playwright/test';
import { createMockFiles, MOCK_FILES } from '@/__tests__/__mocks__/file';
import { createMockFolder } from '@/__tests__/__mocks__/folder';

test.describe('folder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('folder CRUD', () => {
    test('should create a new folder via dialog', async ({ page }) => {
      await createMockFiles(page);
      await page.reload();

      const newFolderIcon = page.getByTitle(/#icon-ic_folder_new/i);

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
      await page.reload();

      const folderItem = page.getByText('My Documents');

      await expect(folderItem).toBeInViewport();
    });

    test('should delete a folder', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Delete Me');
      await page.reload();

      const folderItem = page.locator('.folder-row:has-text("Delete Me")');

      await folderItem.getByTitle(/#icon-ic_trash/i).click();
      await expect(page.getByText('Delete Me')).toBeHidden();
    });
  });

  test.describe('folder navigation', () => {
    test('should navigate into folder and show breadcrumb', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Work Files');
      await page.reload();

      const folderItem = page.locator('.folder-row:has-text("Work Files")');

      await folderItem.click();

      await expect(page.getByRole('button', { name: /all files/i })).toBeInViewport();
      await expect(page.getByText('Work Files')).toBeInViewport();
    });

    test('should navigate back to root via breadcrumb', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Navigate Back');
      await page.reload();

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
      await page.reload();

      const { name } = MOCK_FILES[0];
      const li = page.locator(`li.sign-file:has-text("${name}")`);

      await expect(li.getByTitle(/#icon-ic_folder_move/i)).toBeInViewport();
    });

    test('should open move modal when clicking move icon', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Destination');
      await page.reload();

      const { name } = MOCK_FILES[0];
      const li = page.locator(`li.sign-file:has-text("${name}")`);

      await li.getByTitle(/#icon-ic_folder_move/i).click();
      await expect(page.getByText(/move to folder/i)).toBeInViewport();
      await expect(page.getByText('Destination')).toBeInViewport();
    });
  });
});
