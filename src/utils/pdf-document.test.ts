import { describe, expect, it, vi } from 'vitest';
import { collectOverlays, OVERLAY_DPI, unlockOriginal } from './pdf-document';
import { inspectPdf } from './pdf-export/testing/inspect';
import { createSourcePdf, PAGE_TEXTS, readEncryptedSource, SOURCE_PASSWORD } from './pdf-export/testing/source';
import type { PDF } from '@/types/pdf';

function toDocument(bytes: Uint8Array): PDF & { data: File } {
  const data = new File([bytes], 'contract.pdf', { type: 'application/pdf' });

  return { PDFId: 'doc-1', name: 'contract', updateDate: 1, pages: PAGE_TEXTS.length, data };
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
