import { importModule } from './common';
import type { Page } from '@playwright/test';

interface FolderStoreModule {
  useFolderStore: () => {
    createFolder: (name: string) => void;
    navigateTo: (folderId: string | null) => void;
    folderList: Array<{ folderId: string; name: string; parentId: string | null }>;
  };
}

export async function createMockFolder(page: Page, name: string) {
  await page.addScriptTag({ content: `${importModule}` });

  return page.evaluate(async folderName => {
    const { useFolderStore } = await importModule<FolderStoreModule>('/src/stores');
    const store = useFolderStore();

    store.createFolder(folderName);

    return store.folderList[0];
  }, name);
}

export async function createMockFolders(page: Page, names: string[]) {
  await page.addScriptTag({ content: `${importModule}` });

  return page.evaluate(async folderNames => {
    const { useFolderStore } = await importModule<FolderStoreModule>('/src/stores');
    const store = useFolderStore();

    for (const name of folderNames) {
      store.createFolder(name);
    }

    return store.folderList;
  }, names);
}
