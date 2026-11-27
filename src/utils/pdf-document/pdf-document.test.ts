import { describe, expect, it, vi } from 'vitest';
import { inspectPdf } from '../pdf-export/testing/inspect';
import { createPng } from '../pdf-export/testing/png';
import { createSourcePdf, PAGE_TEXTS, readEncryptedSource, SOURCE_PASSWORD } from '../pdf-export/testing/source';
import {
  collectOverlays,
  createEditingBackground,
  OVERLAY_DPI,
  toPageOverlays,
  toSigningFile,
  toStoredDocument,
  unlockOriginal,
} from '.';
import type { PDF, StoredOverlay } from '@/types/pdf';

function toDocument(bytes: BlobPart): PDF & { data: File } {
  const data = new File([bytes], 'contract.pdf', { type: 'application/pdf' });

  return { PDFId: 'doc-1', name: 'contract', updateDate: 1, pages: PAGE_TEXTS.length, data };
}

function requireFile(file: File | null): File {
  if (!file) throw new Error('Expected a file');

  return file;
}

async function toBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

describe('unlockOriginal', () => {
  it.each(['rc4-128', 'aes-128', 'aes-256'])(
    '%s 加密的上傳檔，存下來的原始檔不需密碼即可開啟，也不保存密碼',
    async variant => {
      const document = toDocument(await readEncryptedSource(variant));
      const unlocked = await unlockOriginal(document, SOURCE_PASSWORD);
      const pages = await inspectPdf(await toBytes(unlocked.data));

      expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
      expect(unlocked.password).toBeUndefined();
      expect(unlocked.data.name).toBe('contract.pdf');
      expect(unlocked.data.type).toBe('application/pdf');
    },
  );

  it('上傳時沒有輸入密碼，原始檔原封不動', async () => {
    const document = toDocument(await createSourcePdf());
    const unlocked = await unlockOriginal(document, '');

    expect(unlocked.data).toBe(document.data);
    expect(unlocked.password).toBeUndefined();
  });

  it('解除密碼失敗時不擋上傳：保留原始檔並記下密碼', async () => {
    const document = toDocument(new TextEncoder().encode('not a pdf that pdf-lib can parse'));
    const unlocked = await unlockOriginal(document, SOURCE_PASSWORD);

    expect(unlocked.data).toBe(document.data);
    expect(unlocked.password).toBe(SOURCE_PASSWORD);
  });
});

describe('collectOverlays', () => {
  it('每頁匯出一張 overlay，頁碼從 1 開始，沒有簽名的頁不存', async () => {
    const first = new Blob(['first'], { type: 'image/png' });
    const third = new Blob(['third'], { type: 'image/png' });
    const pages = [
      { exportOverlay: vi.fn().mockResolvedValue({ blob: first, x: 0.1, y: 0.2, width: 0.3, height: 0.1 }) },
      { exportOverlay: vi.fn().mockResolvedValue(null) },
      { exportOverlay: vi.fn().mockResolvedValue({ blob: third, x: 0.5, y: 0.6, width: 0.2, height: 0.05 }) },
    ];

    await expect(collectOverlays(pages)).resolves.toEqual([
      { page: 1, image: first, x: 0.1, y: 0.2, width: 0.3, height: 0.1 },
      { page: 3, image: third, x: 0.5, y: 0.6, width: 0.2, height: 0.05 },
    ]);
  });

  it('以固定解析度匯出，不受螢幕像素密度影響', async () => {
    const page = { exportOverlay: vi.fn().mockResolvedValue(null) };

    await collectOverlays([page]);

    expect(page.exportOverlay).toHaveBeenCalledWith({ dpi: OVERLAY_DPI });
    expect(OVERLAY_DPI).toBe(300);
  });
});

const DEFAULT_BOX = { x: 0.1, y: 0.2, width: 0.3, height: 0.1 };

function createStoredOverlay(page: number, box = DEFAULT_BOX): StoredOverlay {
  return { page, ...box, image: new Blob([createPng(120, 40)], { type: 'image/png' }) };
}

describe('toPageOverlays', () => {
  it('把儲存的 overlay 轉成匯出模組用的格式，位置與頁碼不變', async () => {
    const stored = createStoredOverlay(2);
    const [overlay] = await toPageOverlays([stored]);

    expect(overlay).toEqual({ page: 2, x: 0.1, y: 0.2, width: 0.3, height: 0.1, image: createPng(120, 40) });
  });
});

describe('createEditingBackground', () => {
  it('把既有 overlay 畫進編輯用底圖，原始檔不被改動', async () => {
    const source = await createSourcePdf();
    const document = { ...toDocument(source), overlays: [createStoredOverlay(1), createStoredOverlay(3)] };
    const background = await createEditingBackground(document);
    const pages = await inspectPdf(await toBytes(requireFile(background)));

    expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
    expect(pages.map(page => page.images.length)).toEqual([1, 0, 1, ...PAGE_TEXTS.slice(3).map(() => 0)]);
    expect(await toBytes(document.data)).toEqual(source);
  });

  it('同一頁先後兩次簽署的 overlay 都會出現在底圖上', async () => {
    const overlays = [createStoredOverlay(1), createStoredOverlay(1, { x: 0.5, y: 0.6, width: 0.2, height: 0.05 })];
    const background = await createEditingBackground({ ...toDocument(await createSourcePdf()), overlays });
    const [firstPage] = await inspectPdf(await toBytes(requireFile(background)));

    expect(firstPage?.images).toHaveLength(2);
  });

  it('還沒有任何 overlay 時不需要底圖，直接用原始檔', async () => {
    const document = { ...toDocument(await createSourcePdf()), overlays: [] };

    await expect(createEditingBackground(document)).resolves.toBeNull();
  });

  it('原始檔保留著密碼時，底圖不需密碼即可開啟', async () => {
    const document = { ...toDocument(await readEncryptedSource('aes-256')), password: SOURCE_PASSWORD };
    const background = await createEditingBackground(document);

    await expect(inspectPdf(await toBytes(requireFile(background)))).resolves.toHaveLength(PAGE_TEXTS.length);
  });
});

describe('createEditingBackground：原始檔是圖片', () => {
  it('底圖是 PDF 檔，簽名頁才會用 PDF 的方式載入它', async () => {
    const data = new File([createPng(90, 120)], 'photo.png', { type: 'image/png' });
    const document = {
      PDFId: 'doc-2',
      name: 'photo',
      updateDate: 1,
      pages: 1,
      data,
      overlays: [createStoredOverlay(1)],
    };
    const background = requireFile(await createEditingBackground(document));
    const [page] = await inspectPdf(await toBytes(background));

    expect(background.type).toBe('application/pdf');
    expect(page?.images).toHaveLength(2);
  });
});

describe('編輯用底圖與儲存的文件', () => {
  it('簽名頁顯示底圖，沒有底圖時顯示原始檔', async () => {
    const document = toDocument(await createSourcePdf());
    const background = new File(['background'], 'contract.pdf');

    expect(toSigningFile({ ...document, background }).data).toBe(background);
    expect(toSigningFile(document).data).toBe(document.data);
  });

  it('存回清單的文件保留原始檔與 overlay，不帶編輯用底圖', async () => {
    const document = { ...toDocument(await createSourcePdf()), overlays: [createStoredOverlay(1)] };
    const stored = toStoredDocument({ ...document, background: new File(['background'], 'contract.pdf') });

    expect(stored).toEqual(document);
    expect('background' in stored).toBe(false);
  });
});
