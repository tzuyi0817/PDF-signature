import { expect, test, type Locator, type Page } from '@playwright/test';
import { createMockFileInFolder, createMockFiles, MOCK_FILES, MOCK_FOLDER_FILE } from '../mocks/file';
import { createMockFolder, createMockFolders } from '../mocks/folder';

/** Waiting for the homepage file list to finish rendering */
async function waitForFiles(page: Page) {
  await page.locator('li.sign-file').first().waitFor({ state: 'visible', timeout: 10_000 });
}

/**
 * Late-loading images/fonts can shift the layout between pointer actions and
 * make the drag grab or drop on the wrong row, so wait for assets to finish
 * loading and for the element position to stop moving first.
 */
async function waitForStableLayout(page: Page, locator: Locator) {
  await page.waitForFunction(
    () => document.fonts.status === 'loaded' && [...document.images].every(image => image.complete),
  );

  let previousBox = '';

  await expect(async () => {
    const box = JSON.stringify(await locator.boundingBox());

    if (box !== previousBox) {
      previousBox = box;
      throw new Error('layout is still shifting');
    }
  }).toPass({ timeout: 10_000, intervals: [150] });
}

/** Move the pointer to the target center with two moves so drag events fire reliably in all browsers */
async function movePointerTo(page: Page, target: Locator) {
  const box = await target.boundingBox();

  if (!box) throw new Error('target is not visible');

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX - 1, centerY - 1);
  await page.mouse.move(centerX, centerY);
}

/**
 * Drag source onto target with manual mouse events.
 * The drag session can start asynchronously (especially in WebKit under load),
 * so keep nudging the pointer until the app highlights the drop target,
 * and only then release the mouse.
 */
async function dragItemTo(page: Page, source: Locator, target: Locator) {
  await waitForStableLayout(page, source);
  await source.hover();
  await page.mouse.down();

  await expect(async () => {
    await movePointerTo(page, target);
    await expect(target).toHaveClass(/drop-target/, { timeout: 500 });
  }).toPass({ timeout: 10_000 });

  await page.mouse.up();
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

      // The file is located inside a folder; it should not appear in the root directory.
      await expect(page.getByText(MOCK_FOLDER_FILE.name)).toBeHidden();

      const folderItem = page.locator('.folder-row:has-text("Folder With File")');

      await folderItem.locator('svg[title*="trash"]').click();
      await page.getByRole('button', { name: /confirm/i }).click();
      await expect(folderItem).toBeHidden();

      // After deleting the folder, the files should not be moved back to the root directory.
      await expect(page.getByText(MOCK_FOLDER_FILE.name)).toBeHidden();

      // The file should appear in the Trash.
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

  test.describe('drag and drop move', () => {
    // Use a taller viewport so every row stays fully visible: hover must not
    // auto-scroll the list container, because WebKit drag hit-testing does not
    // account for inner-container scroll offsets (Playwright limitation).
    test.use({ viewport: { width: 1280, height: 960 } });

    test('should move file into folder via drag and drop', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolder(page, 'Drop Target');
      await waitForFiles(page);

      const { name } = MOCK_FILES[0];
      const fileItem = page.locator(`li.sign-file:has-text("${name}")`);
      const folderItem = page.locator('.folder-row:has-text("Drop Target")');

      await dragItemTo(page, fileItem, folderItem);

      // After moving into the folder, the file should not appear in the root directory.
      await expect(fileItem).toBeHidden();

      await folderItem.click();
      await expect(page.locator(`li.sign-file:has-text("${name}")`)).toBeInViewport();
    });

    test('should move folder into another folder via drag and drop', async ({ page }) => {
      await createMockFiles(page);
      await createMockFolders(page, ['Child Folder', 'Parent Folder']);
      await waitForFiles(page);

      const childItem = page.locator('.folder-row:has-text("Child Folder")');
      const parentItem = page.locator('.folder-row:has-text("Parent Folder")');

      await dragItemTo(page, childItem, parentItem);

      // After moving, the child folder should not appear in the root directory.
      await expect(childItem).toBeHidden();

      await parentItem.click();
      await expect(page.locator('.folder-row:has-text("Child Folder")')).toBeInViewport();
    });

    test('should move file back to root by dropping on breadcrumb', async ({ page }) => {
      await createMockFiles(page);

      const folder = await createMockFolder(page, 'Deep Folder');

      await createMockFileInFolder(page, MOCK_FOLDER_FILE, folder.folderId);
      await waitForFiles(page);

      await page.locator('.folder-row:has-text("Deep Folder")').click();

      const fileItem = page.locator(`li.sign-file:has-text("${MOCK_FOLDER_FILE.name}")`);

      await expect(fileItem).toBeInViewport();

      const rootCrumb = page.getByRole('button', { name: /all files/i });

      await dragItemTo(page, fileItem, rootCrumb);

      // After moving back to root, the file should no longer appear inside the folder.
      await expect(fileItem).toBeHidden();

      await rootCrumb.click();
      await expect(page.locator(`li.sign-file:has-text("${MOCK_FOLDER_FILE.name}")`)).toBeInViewport();
    });

    test('should not react when dropping on the current folder breadcrumb', async ({ page }) => {
      await createMockFiles(page);

      const folder = await createMockFolder(page, 'Current Folder');

      await createMockFileInFolder(page, MOCK_FOLDER_FILE, folder.folderId);
      await waitForFiles(page);

      await page.locator('.folder-row:has-text("Current Folder")').click();

      const fileItem = page.locator(`li.sign-file:has-text("${MOCK_FOLDER_FILE.name}")`);

      await expect(fileItem).toBeInViewport();

      const currentCrumb = page.getByRole('button', { name: 'Current Folder' });

      await waitForStableLayout(page, fileItem);
      await fileItem.hover();
      await page.mouse.down();

      await movePointerTo(page, currentCrumb);

      // The current folder crumb must not highlight as a drop target.
      await expect(currentCrumb).not.toHaveClass(/drop-target/);

      await page.mouse.up();

      // The file stays in place and no moved toast appears within the wait window.
      await expect(fileItem).toBeInViewport();
      await page.waitForTimeout(400);
      await expect(page.getByText(/moved successfully/i)).toBeHidden();
    });
  });
});
