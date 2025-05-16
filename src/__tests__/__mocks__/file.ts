import { readFileSync } from 'node:fs';
import { type Page } from '@playwright/test';
import type { PdfStore } from '@/stores';
import { importModule } from './common';

const MOCK_BASE64_IMAGE = `data:image/png;base64,${readFileSync('src/assets/logo/logo_darkbg_horizontal.png', 'base64')}`;

export const MOCK_FILES = [
  {
    PDFBase64: '',
    PDFId: 'pdf-1722503077985',
    canvas: [MOCK_BASE64_IMAGE, MOCK_BASE64_IMAGE, MOCK_BASE64_IMAGE],
    name: '員工福利補助申請作業',
    pages: 3,
    updateDate: 1722503086048,
  },
  {
    PDFBase64: '',
    PDFId: 'pdf-1722503018048',
    canvas: [MOCK_BASE64_IMAGE, MOCK_BASE64_IMAGE],
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

    mockFiles.forEach(async file => await addPDF(file));
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
