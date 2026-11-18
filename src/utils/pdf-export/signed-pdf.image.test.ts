import { describe, expect, it } from 'vitest';
import { createSignedPdf } from './signed-pdf';
import { inspectPdf } from './testing/inspect';
import { createPng } from './testing/png';
import { readJpegSource } from './testing/source';
import type { Box, PageOverlay } from './types';

const BOX: Box = { x: 0.1, y: 0.2, width: 0.3, height: 0.1 };
const OVERLAY: PageOverlay = { page: 1, image: createPng(120, 40), ...BOX };
/** 與 PDF 來源相同的驗收標準：位置誤差不超過 1pt */
const TOLERANCE = 1;

/** 頁面縮放到剛好放進同方向的 A4（595.28 × 841.89pt），並維持圖片的長寬比 */
const IMAGE_SOURCES = [
  ['直向 PNG（90×120，受寬度限制）', () => Promise.resolve(createPng(90, 120)), { width: 595.28, height: 793.71 }],
  ['橫向 JPEG（60×40，放進橫放的 A4）', readJpegSource, { width: 841.89, height: 561.26 }],
  ['長條 PNG（40×120，受高度限制）', () => Promise.resolve(createPng(40, 120)), { width: 280.63, height: 841.89 }],
] as const;

describe.each(IMAGE_SOURCES)('createSignedPdf：原始檔是%s', (_, readSource, size) => {
  it('輸出單頁 PDF，頁面放得進同方向的 A4 並維持圖片的長寬比，圖片鋪滿整頁', async () => {
    const [page, ...rest] = await inspectPdf(await createSignedPdf(await readSource(), []));

    expect(rest).toHaveLength(0);
    expect(page?.width).toBeCloseTo(size.width, 1);
    expect(page?.height).toBeCloseTo(size.height, 1);
    expect(page?.rotation).toBe(0);
    expect(page?.images).toHaveLength(1);
    expect(page?.images[0]?.x).toBeCloseTo(0);
    expect(page?.images[0]?.y).toBeCloseTo(0);
    expect(page?.images[0]?.width).toBeCloseTo(1);
    expect(page?.images[0]?.height).toBeCloseTo(1);
  });

  it('簽名疊在圖片之上，落在畫面指定位置的 1pt 以內', async () => {
    const [page] = await inspectPdf(await createSignedPdf(await readSource(), [OVERLAY]));
    const signature = page?.images[1];

    expect(page?.images).toHaveLength(2);
    expect(Math.abs((signature?.x ?? Infinity) - BOX.x) * (page?.viewWidth ?? 0)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs((signature?.y ?? Infinity) - BOX.y) * (page?.viewHeight ?? 0)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs((signature?.width ?? Infinity) - BOX.width) * (page?.viewWidth ?? 0)).toBeLessThanOrEqual(
      TOLERANCE,
    );
    expect(Math.abs((signature?.height ?? Infinity) - BOX.height) * (page?.viewHeight ?? 0)).toBeLessThanOrEqual(
      TOLERANCE,
    );
  });

  it('下載時設了密碼，輸出需要該密碼才能開啟', async () => {
    const output = await createSignedPdf(await readSource(), [OVERLAY], { password: 'download-pass' });

    await expect(inspectPdf(output)).rejects.toThrow('No password given');
    await expect(inspectPdf(output, 'download-pass')).resolves.toHaveLength(1);
  });

  it('簽名頁碼超出唯一的一頁時丟出錯誤', async () => {
    await expect(createSignedPdf(await readSource(), [{ ...OVERLAY, page: 2 }])).rejects.toThrow(
      'Overlay page 2 is out of range',
    );
  });
});

describe('createSignedPdf：無法辨識的原始檔', () => {
  it('既不是 PDF 也不是 PNG／JPEG 時丟出錯誤', async () => {
    await expect(createSignedPdf(new TextEncoder().encode('not a document'), [])).rejects.toThrow();
  });
});
