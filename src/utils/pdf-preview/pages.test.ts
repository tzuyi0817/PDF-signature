import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { createSourcePdf, PAGE_SPECS } from '../pdf-export/testing/source';
import { MAX_PIXEL_RATIO, readPageSizes, toPixelWidth } from './pages';

describe('readPageSizes', () => {
  it('回傳每一頁在畫面上的尺寸，旋轉 90／270 度的頁面寬高對調', async () => {
    const loadingTask = getDocument({ data: await createSourcePdf() });
    const sizes = await readPageSizes(await loadingTask.promise);

    await loadingTask.destroy();

    expect(sizes).toHaveLength(PAGE_SPECS.length);

    for (const [index, spec] of PAGE_SPECS.entries()) {
      const [width, height] = spec.size;
      const isSideways = spec.rotation === 90 || spec.rotation === 270;
      const visibleWidth = spec.cropBox?.[2] ?? width;
      const visibleHeight = spec.cropBox?.[3] ?? height;

      expect(sizes[index]?.width).toBeCloseTo(isSideways ? visibleHeight : visibleWidth, 1);
      expect(sizes[index]?.height).toBeCloseTo(isSideways ? visibleWidth : visibleHeight, 1);
    }
  });
});

describe('toPixelWidth', () => {
  it('顯示寬乘上裝置像素密度', () => {
    expect(toPixelWidth(400, 1)).toBe(400);
    expect(toPixelWidth(400.4, 2)).toBe(801);
  });

  it('像素密度超過上限時不再放大，避免 canvas 過大', () => {
    expect(toPixelWidth(400, 3)).toBe(400 * MAX_PIXEL_RATIO);
  });

  it('像素密度不合理時當成 1', () => {
    expect(toPixelWidth(400, 0)).toBe(400);
  });
});
