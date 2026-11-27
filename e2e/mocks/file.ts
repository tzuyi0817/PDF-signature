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

interface ConfigStoreModule {
  useConfigStore: () => { updateFilePassword: (password: string) => void };
}

interface IdbModule {
  getIdb: <T>(key: IDBValidKey) => Promise<T | undefined>;
}

/** 完成頁要預覽的文件種類 */
export type MockCurrentKind = 'signed' | 'edited' | 'legacy' | 'image' | 'broken';

export const MOCK_IMAGE_SOURCE_WIDTH = 200;
/** 預覽用文件的 overlay 位置（頁面寬高的 0–1 比例） */
export const MOCK_OVERLAY_BOX = { x: 0.1, y: 0.2, width: 0.3, height: 0.1 };

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

/** 整頁 PNG（舊文件）與第一頁縮圖（新文件）的像素寬，測試用來分辨列表縮圖讀的是哪一張 */
export const MOCK_PAGE_IMAGE_WIDTH = 60;
export const MOCK_THUMBNAIL_WIDTH = 30;
export const STORED_BLOB = '@stored-blob';

/** 只留可以跨 `page.evaluate` 傳遞的欄位 */
function toMeta({ PDFId, name, pages, updateDate, folderId }: PDF) {
  return { PDFId, name, pages, updateDate, folderId };
}

/** Playwright 的 WebKit 把 Blob／File 存進 IndexedDB 會失敗（錯誤是 null）；其他引擎可以 */
export function canStoreBlobs(page: Page) {
  return page.context().browser()?.browserType().name() !== 'webkit';
}

/**
 * 建立此變更前儲存的文件（沒有原始檔，只有整頁 PNG）。
 * Blob 無法跨 `page.evaluate` 傳遞，整頁 PNG 以位元組帶進頁面後再組回，每頁一張。
 * WebKit 存不了 Blob，在那裡文件沒有頁面影像：列表類的測試照跑，需要頁面影像的測試要掛 `STORED_BLOB`。
 */
export async function createMockFiles(page: Page, files: PDF[] = MOCK_FILES) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(
    async ({ mockFiles, png, hasPages }) => {
      const { usePdfStore } = await importModule<PdfStore>('/src/stores');
      const { addPDF } = usePdfStore();

      for (const file of mockFiles) {
        const canvas = Array.from({ length: hasPages ? file.pages : 0 }, () => {
          return new Blob([new Uint8Array(png)], { type: 'image/png' });
        });

        await addPDF({ ...file, data: null, canvas });
      }
    },
    { mockFiles: files.map(toMeta), png: [...createPng(MOCK_PAGE_IMAGE_WIDTH, 80)], hasPages: canStoreBlobs(page) },
  );
}

/** 建立保有原始檔的文件；`source` 沒給時用帶文字的 7 頁 PDF，`type` 是原始檔的 MIME 類型 */
export async function createMockSignedFile(
  page: Page,
  file: PDF = MOCK_SIGNED_FILE,
  source?: Uint8Array,
  type = 'application/pdf',
) {
  const bytes = source ?? (await createSourcePdf());

  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(
    async ({ mockFile, pdf, sourceType, png, thumbnailPng }) => {
      const { usePdfStore } = await importModule<PdfStore>('/src/stores');
      const data = new File([new Uint8Array(pdf)], mockFile.name, { type: sourceType });
      const image = new Blob([new Uint8Array(png)], { type: 'image/png' });
      const thumbnail = new Blob([new Uint8Array(thumbnailPng)], { type: 'image/png' });

      await usePdfStore().addPDF({
        ...mockFile,
        data,
        overlays: [{ page: 1, x: 0.1, y: 0.2, width: 0.3, height: 0.1, image }],
        thumbnail,
      });
    },
    {
      mockFile: toMeta(file),
      pdf: [...bytes],
      sourceType: type,
      png: [...createPng(120, 40)],
      thumbnailPng: [...createPng(MOCK_THUMBNAIL_WIDTH, 40)],
    },
  );
}

/**
 * 把一份文件設成目前文件（寫進 IndexedDB），之後前往完成頁就會預覽它。
 *
 * - `signed`：7 頁帶文字的原始 PDF，第一頁有一層 overlay
 * - `edited`：同 `signed`，但像從列表重新編輯後一樣帶著編輯用底圖 `background`
 * - `legacy`：此變更前儲存的文件，只有整頁 PNG
 * - `image`：原始檔是 PNG 圖片，有一層 overlay
 * - `broken`：原始檔已損壞，只剩縮圖可顯示
 */
export async function setMockCurrentPDF(page: Page, kind: MockCurrentKind) {
  const pdf = kind === 'signed' || kind === 'edited' ? await createSourcePdf() : new Uint8Array([1, 2, 3]);

  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(
    async ({ mockKind, mockFile, box, bytes }) => {
      const { usePdfStore } = await importModule<PdfStore>('/src/stores');
      const toBlob = (png: number[]) => new Blob([new Uint8Array(png)], { type: 'image/png' });
      const overlays = [{ page: 1, ...box, image: toBlob(bytes.overlay) }];
      const thumbnail = toBlob(bytes.thumbnail);
      const original = new File([new Uint8Array(bytes.pdf)], 'source.pdf', { type: 'application/pdf' });
      const documents = {
        signed: { data: original, overlays, thumbnail },
        edited: { data: original, overlays, thumbnail, background: original },
        legacy: { data: null, canvas: Array.from({ length: mockFile.pages }, () => toBlob(bytes.pageImage)) },
        image: {
          data: new File([toBlob(bytes.imageSource)], 'source.png', { type: 'image/png' }),
          overlays,
          thumbnail,
        },
        broken: { data: original, overlays, thumbnail },
      };

      await usePdfStore().setCurrentPDF({ ...mockFile, ...documents[mockKind] });
    },
    {
      mockKind: kind,
      mockFile: toMeta(kind === 'legacy' ? MOCK_FILES[0] : MOCK_SIGNED_FILE),
      box: MOCK_OVERLAY_BOX,
      bytes: {
        pdf: [...pdf],
        overlay: [...createPng(120, 40)],
        thumbnail: [...createPng(MOCK_THUMBNAIL_WIDTH, 40)],
        pageImage: [...createPng(MOCK_PAGE_IMAGE_WIDTH, 80)],
        imageSource: [...createPng(MOCK_IMAGE_SOURCE_WIDTH, 100)],
      },
    },
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

/** 讀出 IndexedDB 中某份清單，只回傳每筆是否帶原始檔與編輯用底圖 */
export async function readStoredList(page: Page, key: string) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async idbKey => {
    const { getIdb } = await importModule<IdbModule>('/src/utils/idb.ts');
    const list = (await getIdb<PDF[]>(idbKey)) ?? [];

    return list.map(document => ({ hasData: Boolean(document.data), hasBackground: 'background' in document }));
  }, key);
}

/** 在頁面內設定上傳密碼，模擬前一次上傳留下的值 */
export async function setFilePassword(page: Page, password: string) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async value => {
    const { useConfigStore } = await importModule<ConfigStoreModule>('/src/stores');

    useConfigStore().updateFilePassword(value);
  }, password);
}

/** 讀出 IndexedDB 中某份文件是否帶著上傳密碼 */
export async function readStoredPassword(page: Page, key: string) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async idbKey => {
    const { getIdb } = await importModule<IdbModule>('/src/utils/idb.ts');

    return (await getIdb<PDF>(idbKey))?.password;
  }, key);
}

/** 讀出 IndexedDB 中某份文件的 overlay 數量 */
export async function readStoredOverlayCount(page: Page, key: string) {
  await page.addScriptTag({ content: String(importModule) });

  return page.evaluate(async idbKey => {
    const { getIdb } = await importModule<IdbModule>('/src/utils/idb.ts');

    return (await getIdb<PDF>(idbKey))?.overlays?.length ?? 0;
  }, key);
}
