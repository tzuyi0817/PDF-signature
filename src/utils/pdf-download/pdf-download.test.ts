import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inspectPdf } from '../pdf-export/testing/inspect';
import { createPng } from '../pdf-export/testing/png';
import { createSourcePdf, PAGE_TEXTS, readEncryptedSource, SOURCE_PASSWORD } from '../pdf-export/testing/source';
import { renderSignedPages } from './raster-pages';
import { createDownloadFile } from '.';
import type { PDF, StoredOverlay } from '@/types/pdf';

vi.mock('./raster-pages', () => ({ renderSignedPages: vi.fn() }));

const PASSWORD = 'download-pass';
const OVERLAY: StoredOverlay = {
  page: 1,
  x: 0.1,
  y: 0.2,
  width: 0.3,
  height: 0.1,
  image: new Blob([createPng(120, 40)], { type: 'image/png' }),
};
const BASE: PDF = { PDFId: 'doc-1', name: 'contract', updateDate: 1, pages: 1, data: null };

function createPageImage() {
  return new Blob([createPng(60, 80)], { type: 'image/png' });
}

function toOriginal(bytes: BlobPart): File {
  return new File([bytes], 'contract.pdf', { type: 'application/pdf' });
}

async function inspect(file: File, password?: string) {
  return inspectPdf(new Uint8Array(await file.arrayBuffer()), password);
}

beforeEach(() => {
  vi.mocked(renderSignedPages).mockReset();
});

describe('createDownloadFile：保有原始檔的文件', () => {
  it('在原始檔上疊簽名，文字仍可抽取，檔名用文件名稱', async () => {
    const file = await createDownloadFile({ ...BASE, data: toOriginal(await createSourcePdf()), overlays: [OVERLAY] });
    const pages = await inspect(file);

    expect(file.name).toBe('contract.pdf');
    expect(file.type).toBe('application/pdf');
    expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
    expect(pages[0]?.images).toHaveLength(1);
    expect(renderSignedPages).not.toHaveBeenCalled();
  });

  it('還沒簽名（沒有 overlay）也能匯出', async () => {
    const file = await createDownloadFile({ ...BASE, data: toOriginal(await createSourcePdf()) });

    await expect(inspect(file)).resolves.toHaveLength(PAGE_TEXTS.length);
  });

  it('給了密碼時加密輸出', async () => {
    const document = { ...BASE, data: toOriginal(await createSourcePdf()), overlays: [OVERLAY] };
    const file = await createDownloadFile(document, PASSWORD);

    await expect(inspect(file)).rejects.toThrow('No password given');
    await expect(inspect(file, PASSWORD)).resolves.toHaveLength(PAGE_TEXTS.length);
  });

  it('原始檔保留著上傳密碼時，用它開啟原始檔，輸出不需密碼', async () => {
    const data = toOriginal(await readEncryptedSource('aes-256'));
    const file = await createDownloadFile({ ...BASE, data, password: SOURCE_PASSWORD, overlays: [OVERLAY] });

    await expect(inspect(file)).resolves.toHaveLength(PAGE_TEXTS.length);
  });
});

describe('createDownloadFile：新路徑失敗時退回轉圖匯出', () => {
  const broken = { ...BASE, data: toOriginal('not a pdf'), password: SOURCE_PASSWORD, overlays: [OVERLAY] };

  it('把原始檔、overlay 與上傳密碼交給轉圖，用轉出的頁面與各自的尺寸組成 PDF', async () => {
    vi.mocked(renderSignedPages).mockResolvedValue([
      { image: createPageImage(), width: 210, height: 297 },
      { image: createPageImage(), width: 300, height: 200 },
    ]);

    const pages = await inspect(await createDownloadFile(broken));

    expect(renderSignedPages).toHaveBeenCalledWith(broken.data, broken.overlays, SOURCE_PASSWORD);
    expect(pages.map(page => [Math.round(page.viewWidth), Math.round(page.viewHeight)])).toEqual([
      [595, 842],
      [850, 567],
    ]);
  });

  it('退回轉圖時，下載密碼仍然生效', async () => {
    vi.mocked(renderSignedPages).mockResolvedValue([{ image: createPageImage(), width: 210, height: 297 }]);

    const file = await createDownloadFile(broken, PASSWORD);

    await expect(inspect(file)).rejects.toThrow('No password given');
    await expect(inspect(file, PASSWORD)).resolves.toHaveLength(1);
  });

  it('連原始檔都無法轉圖時才丟出錯誤', async () => {
    vi.mocked(renderSignedPages).mockRejectedValue(new Error('Cannot render'));

    await expect(createDownloadFile(broken)).rejects.toThrow('Cannot render');
  });
});

describe('createDownloadFile：此變更前儲存的文件', () => {
  it('只有整頁 PNG 時用 jsPDF 路徑，沿用文件記錄的頁面尺寸', async () => {
    const document = { ...BASE, canvas: [createPageImage(), createPageImage()], width: 300, height: 200 };
    const pages = await inspect(await createDownloadFile(document));

    expect(pages.map(page => [Math.round(page.viewWidth), Math.round(page.viewHeight)])).toEqual([
      [850, 567],
      [850, 567],
    ]);
    expect(renderSignedPages).not.toHaveBeenCalled();
  });

  it('給了密碼時加密輸出', async () => {
    const file = await createDownloadFile({ ...BASE, canvas: [createPageImage()] }, PASSWORD);

    await expect(inspect(file)).rejects.toThrow('No password given');
    await expect(inspect(file, PASSWORD)).resolves.toHaveLength(1);
  });

  it('既沒有原始檔也沒有整頁 PNG 時丟出錯誤', async () => {
    await expect(createDownloadFile(BASE)).rejects.toThrow('nothing to export');
    await expect(createDownloadFile({ ...BASE, canvas: [] })).rejects.toThrow('nothing to export');
  });
});
