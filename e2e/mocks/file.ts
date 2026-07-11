import { importModule } from './common';
import type { PdfStore } from '@/stores';
import type { PDF } from '@/types/pdf';
import type { Page } from '@playwright/test';

export const MOCK_FILES: [PDF, PDF] = [
  {
    data: null,
    PDFId: 'pdf-1722503077985',
    canvas: [],
    name: '員工福利補助申請作業',
    pages: 3,
    updateDate: 1722503086048,
  },
  {
    data: null,
    PDFId: 'pdf-1722503018048',
    canvas: [],
    name: '2023行事曆',
    pages: 2,
    updateDate: 1722503025664,
  },
];

export const MOCK_FOLDER_FILE: PDF = {
  data: null,
  PDFId: 'pdf-in-folder-1722503099999',
  canvas: [],
  name: '資料夾內測試檔案',
  pages: 1,
  updateDate: 1722503099999,
};

/** 在指定資料夾內建立 mock 檔案 */
export async function createMockFileInFolder(page: Page, file: PDF, folderId: string) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(
    async ({ mockFile, mockFolderId }) => {
      const { usePdfStore } = await importModule<PdfStore>('/src/stores');
      const { addPDF } = usePdfStore();

      await addPDF({ ...mockFile, folderId: mockFolderId });
    },
    { mockFile: file, mockFolderId: folderId },
  );
}

export async function createMockFiles(page: Page) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async mockFiles => {
    const { usePdfStore } = await importModule<PdfStore>('/src/stores');
    const { addPDF } = usePdfStore();

    for (const file of mockFiles) {
      await addPDF(file);
    }
  }, MOCK_FILES);
}

export async function clearMockFiles(page: Page) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async mockFiles => {
    const { usePdfStore } = await importModule<PdfStore>('/src/stores');
    const { deletePDF } = usePdfStore();

    for (const file of mockFiles) {
      await deletePDF(file.PDFId);
    }
  }, MOCK_FILES);
}
