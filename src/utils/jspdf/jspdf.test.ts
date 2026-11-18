import { describe, expect, it, vi } from 'vitest';
import { inspectPdf } from '../pdf-export/testing/inspect';
import { createPng } from '../pdf-export/testing/png';
import { createRasterPdf, generatePDF } from '.';
import type { PDF } from '@/types/pdf';

/** A4 的寬高（pt），對應預設的 210 × 297mm */
const A4_POINTS = { width: 595.28, height: 841.89 };
const MM_TO_POINTS = 72 / 25.4;

function createPages(count: number): Blob[] {
  return Array.from({ length: count }, () => new Blob([createPng(60, 80)], { type: 'image/png' }));
}

function toBytes(pdf: Awaited<ReturnType<typeof createRasterPdf>>) {
  return new Uint8Array(pdf.output('arraybuffer'));
}

describe('createRasterPdf', () => {
  it('每張頁面影像各成一頁並鋪滿，沒指定尺寸時是 A4', async () => {
    const pages = await inspectPdf(toBytes(await createRasterPdf(createPages(3))));

    expect(pages).toHaveLength(3);

    for (const page of pages) {
      expect(page.width).toBeCloseTo(A4_POINTS.width, 1);
      expect(page.height).toBeCloseTo(A4_POINTS.height, 1);
      expect(page.images).toHaveLength(1);
      expect(page.images[0]?.width).toBeCloseTo(1);
      expect(page.images[0]?.height).toBeCloseTo(1);
    }
  });

  it('指定頁面尺寸（mm）時，寬大於高的頁面是橫向', async () => {
    const [page] = await inspectPdf(toBytes(await createRasterPdf(createPages(1), { width: 300, height: 200 })));

    expect(page?.viewWidth).toBeCloseTo(300 * MM_TO_POINTS, 1);
    expect(page?.viewHeight).toBeCloseTo(200 * MM_TO_POINTS, 1);
  });

  it('給了密碼時，輸出需要該密碼才能開啟', async () => {
    const bytes = toBytes(await createRasterPdf(createPages(1), { password: 'download-pass' }));

    await expect(inspectPdf(bytes)).rejects.toThrow('No password given');
    await expect(inspectPdf(bytes, 'download-pass')).resolves.toHaveLength(1);
  });

  it('每處理完一頁就回報一次已完成的頁數', async () => {
    const onPage = vi.fn();

    await createRasterPdf(createPages(3), { onPage });

    expect(onPage.mock.calls).toEqual([[1], [2], [3]]);
  });
});

describe('generatePDF', () => {
  const document: PDF = { PDFId: 'legacy-1', name: 'contract', updateDate: 1, pages: 2, data: null };

  it('把舊格式文件的整頁 PNG 組成以文件名稱命名的 PDF 檔', async () => {
    const file = await generatePDF({ ...document, canvas: createPages(2) });

    expect(file?.name).toBe('contract.pdf');
    expect(file?.type).toBe('application/pdf');
    await expect(inspectPdf(new Uint8Array((await file?.arrayBuffer()) ?? []))).resolves.toHaveLength(2);
  });

  it('文件沒有整頁 PNG 時不產生檔案', async () => {
    await expect(generatePDF(document)).resolves.toBeUndefined();
  });
});
