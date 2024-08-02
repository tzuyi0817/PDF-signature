import { type Page } from '@playwright/test';
import { importModule } from './common';
import type { UsePdfStore } from '@/store';

export const MOCK_FILES = [
  {
    PDFBase64: '',
    PDFId: 'pdf-1722503077985',
    canvas: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABw',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABw',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABw',
    ],
    name: '員工福利補助申請作業',
    pages: 3,
    updateDate: 1722503086048,
  },
  {
    PDFBase64: '',
    PDFId: 'pdf-1722503018048',
    canvas: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABw', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABw'],
    name: '2023行事曆',
    pages: 2,
    updateDate: 1722503025664,
  },
];

export async function createMockFiles(page: Page) {
  await page.addScriptTag({ content: `${importModule}` });

  return page.evaluate(async mockFiles => {
    const usePdfStore = await importModule<UsePdfStore>('/src/store/pdf');
    const { addPDF } = usePdfStore();

    mockFiles.forEach(async file => await addPDF(file));
  }, MOCK_FILES);
}

export async function clearMockFiles(page: Page) {
  await page.addScriptTag({ content: `${importModule}` });

  return page.evaluate(async mockFiles => {
    const usePdfStore = await importModule<UsePdfStore>('/src/store/pdf');
    const { deletePDF } = usePdfStore();

    mockFiles.forEach(async file => await deletePDF(file.PDFId));
  }, MOCK_FILES);
}
