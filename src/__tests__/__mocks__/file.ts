import { type Page } from '@playwright/test';
import type { PdfStore } from '@/stores';
import type { PDF } from '@/types/pdf';
import { importModule } from './common';

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

export async function createMockFiles(page: Page) {
  await page.addScriptTag({ content: `${importModule}` });

  return page.evaluate(async mockFiles => {
    const { usePdfStore } = await importModule<PdfStore>('/src/stores');
    const { addPDF } = usePdfStore();

    mockFiles.forEach(async file => {
      await addPDF(file);
    });
  }, MOCK_FILES);
}

export async function clearMockFiles(page: Page) {
  await page.addScriptTag({ content: `${importModule}` });

  return page.evaluate(async mockFiles => {
    const { usePdfStore } = await importModule<PdfStore>('/src/stores');
    const { deletePDF } = usePdfStore();

    mockFiles.forEach(async file => await deletePDF(file.PDFId));
  }, MOCK_FILES);
}

export function createMockBlobs(pages: number) {
  const MOCK_BUFFER = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const MOCK_BLOB = new Blob([MOCK_BUFFER], { type: 'image/png' });

  return Array.from({ length: pages }, () => MOCK_BLOB);
}
