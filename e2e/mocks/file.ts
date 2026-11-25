import { createPng } from '@/utils/pdf-export/testing/png';
import { createSourcePdf } from '@/utils/pdf-export/testing/source';
import { importModule } from './common';
import type { PdfStore } from '@/stores';
import type { PDF, StoredOverlay } from '@/types/pdf';
import type { RasterPage } from '@/utils/jspdf';
import type { Page } from '@playwright/test';

interface DownloadModule {
  createDownloadFile: (doc: PDF, password?: string) => Promise<File>;
}

interface RasterModule {
  renderSignedPages: (file: File, overlays: readonly StoredOverlay[]) => Promise<RasterPage[]>;
}

interface JspdfModule {
  createRasterPdf: (pages: readonly RasterPage[]) => Promise<{ output: (type: 'blob') => Blob }>;
}

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

/** 保有原始檔的文件：原始檔是 7 頁帶文字的 PDF，第一頁有一層簽名 overlay */
export const MOCK_SIGNED_FILE: PDF = {
  data: null,
  PDFId: 'pdf-signed-1722503111111',
  name: '已簽署合約',
  pages: 7,
  updateDate: 1722503111111,
};

/** 原始檔已損壞的文件：新路徑與轉圖退路都無法處理 */
export const MOCK_BROKEN_FILE: PDF = {
  data: null,
  PDFId: 'pdf-broken-1722503122222',
  name: '損壞的檔案',
  pages: 1,
  updateDate: 1722503122222,
};

/** 只留可以跨 `page.evaluate` 傳遞的欄位 */
function toMeta({ PDFId, name, pages, updateDate, folderId }: PDF) {
  return { PDFId, name, pages, updateDate, folderId };
}

/**
 * 建立此變更前儲存的文件（沒有原始檔，只有整頁 PNG）。
 * Blob 無法跨 `page.evaluate` 傳遞，整頁 PNG 以位元組帶進頁面後再組回，每頁一張。
 */
export async function createMockFiles(page: Page, files: PDF[] = MOCK_FILES) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(
    async ({ mockFiles, png }) => {
      const { usePdfStore } = await importModule<PdfStore>('/src/stores');
      const { addPDF } = usePdfStore();

      for (const file of mockFiles) {
        const canvas = Array.from({ length: file.pages }, () => new Blob([new Uint8Array(png)], { type: 'image/png' }));

        await addPDF({ ...file, data: null, canvas });
      }
    },
    { mockFiles: files.map(toMeta), png: [...createPng(60, 80)] },
  );
}

/** 建立保有原始檔的文件；`source` 沒給時用帶文字的 7 頁 PDF */
export async function createMockSignedFile(page: Page, file: PDF = MOCK_SIGNED_FILE, source?: Uint8Array) {
  const bytes = source ?? (await createSourcePdf());

  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(
    async ({ mockFile, pdf, png }) => {
      const { usePdfStore } = await importModule<PdfStore>('/src/stores');
      const data = new File([new Uint8Array(pdf)], `${mockFile.name}.pdf`, { type: 'application/pdf' });
      const image = new Blob([new Uint8Array(png)], { type: 'image/png' });

      await usePdfStore().addPDF({
        ...mockFile,
        data,
        overlays: [{ page: 1, x: 0.1, y: 0.2, width: 0.3, height: 0.1, image }],
      });
    },
    { mockFile: toMeta(file), pdf: [...bytes], png: [...createPng(120, 40)] },
  );
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

/** 在頁面內把同一份文件分別以「疊在原始檔上」與「整頁轉圖」匯出，回傳兩者的位元組數 */
export async function measureExportSizes(page: Page, id: string) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async PDFId => {
    const { usePdfStore } = await importModule<PdfStore>('/src/stores');
    const { createDownloadFile } = await importModule<DownloadModule>('/src/utils/pdf-download/index.ts');
    const { renderSignedPages } = await importModule<RasterModule>('/src/utils/pdf-download/raster-pages.ts');
    const { createRasterPdf } = await importModule<JspdfModule>('/src/utils/jspdf/index.ts');
    const doc = usePdfStore().PDFList.find(item => item.PDFId === PDFId);

    if (!doc?.data) throw new Error('Mock document is missing');

    const overlaid = await createDownloadFile(doc);
    const raster = await createRasterPdf(await renderSignedPages(doc.data, doc.overlays ?? []));

    return { overlaid: overlaid.size, raster: raster.output('blob').size };
  }, id);
}
