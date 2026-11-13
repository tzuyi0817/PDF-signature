import { beforeAll, describe, expect, it } from 'vitest';
import { createSignedPdf } from './signed-pdf';
import { inspectPdf, type PageReport } from './testing/inspect';
import { createPng } from './testing/png';
import {
  createSourcePdf,
  ENCRYPTED_SOURCES,
  PAGE_SPECS,
  PAGE_TEXTS,
  readEncryptedSource,
  SOURCE_PASSWORD,
} from './testing/source';
import type { Box, PageOverlay } from './types';

const IMAGE = createPng(120, 40);
const BOX: Box = { x: 0.1, y: 0.2, width: 0.3, height: 0.1 };
const SECOND_BOX: Box = { x: 0.55, y: 0.7, width: 0.25, height: 0.08 };
/** 票上的驗收標準：位置誤差不超過 1pt */
const TOLERANCE = 1;

function overlayOn(page: number, box: Box = BOX): PageOverlay {
  return { page, image: IMAGE, ...box };
}

/** 影像外框四個邊與預期位置的最大差距（pt） */
function maxEdgeError(report: PageReport, actual: Box | undefined, expected: Box) {
  if (!actual) return Infinity;

  return Math.max(
    Math.abs(actual.x - expected.x) * report.viewWidth,
    Math.abs(actual.y - expected.y) * report.viewHeight,
    Math.abs(actual.x + actual.width - expected.x - expected.width) * report.viewWidth,
    Math.abs(actual.y + actual.height - expected.y - expected.height) * report.viewHeight,
  );
}

describe('createSignedPdf', () => {
  let source: Uint8Array;
  let sourcePages: PageReport[];

  beforeAll(async () => {
    source = await createSourcePdf();
    sourcePages = await inspectPdf(source);
  });

  it('輸出的頁數、每頁尺寸與旋轉都與來源相同', async () => {
    const output = await createSignedPdf(
      source,
      PAGE_SPECS.map((_, index) => overlayOn(index + 1)),
    );
    const pages = await inspectPdf(output);
    const geometry = (reports: PageReport[]) =>
      reports.map(({ width, height, rotation }) => ({ width, height, rotation }));

    expect(pages).toHaveLength(PAGE_SPECS.length);
    expect(geometry(pages)).toEqual(geometry(sourcePages));
  });

  it('疊上簽名後，每頁原本的文字仍可抽取', async () => {
    const output = await createSignedPdf(
      source,
      PAGE_SPECS.map((_, index) => overlayOn(index + 1)),
    );
    const pages = await inspectPdf(output);

    expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
  });

  it.each(PAGE_SPECS.map((spec, index) => [spec.label, index + 1] as const))(
    '%s：簽名落在畫面指定位置的 1pt 以內',
    async (_, pageNumber) => {
      const output = await createSignedPdf(source, [overlayOn(pageNumber)]);
      const report = (await inspectPdf(output))[pageNumber - 1];

      expect(report?.images).toHaveLength(1);
      expect(report && maxEdgeError(report, report.images[0], BOX)).toBeLessThanOrEqual(TOLERANCE);
    },
  );

  it('沒有簽名的頁面不新增任何影像', async () => {
    const output = await createSignedPdf(source, [overlayOn(2)]);
    const pages = await inspectPdf(output);

    expect(pages.map(page => page.images.length)).toEqual([0, 1, 0, 0, 0, 0, 0]);
  });

  it('同一頁有多層簽名時，依序全部畫上且各自位置正確', async () => {
    const output = await createSignedPdf(source, [overlayOn(4, BOX), overlayOn(4, SECOND_BOX)]);
    const report = (await inspectPdf(output))[3];

    expect(report?.images).toHaveLength(2);
    expect(report && maxEdgeError(report, report.images[0], BOX)).toBeLessThanOrEqual(TOLERANCE);
    expect(report && maxEdgeError(report, report.images[1], SECOND_BOX)).toBeLessThanOrEqual(TOLERANCE);
  });

  it('沒有任何簽名時，輸出內容與來源一致', async () => {
    const output = await createSignedPdf(source, []);
    const pages = await inspectPdf(output);

    expect(pages).toEqual(sourcePages);
  });

  it('不修改傳入的來源位元組', async () => {
    const snapshot = new Uint8Array(source);

    await createSignedPdf(source, [overlayOn(1)]);

    expect(source).toEqual(snapshot);
  });

  it('頁碼超出範圍時丟出錯誤', async () => {
    await expect(createSignedPdf(source, [overlayOn(PAGE_SPECS.length + 1)])).rejects.toThrow(
      `Overlay page ${PAGE_SPECS.length + 1} is out of range`,
    );
    await expect(createSignedPdf(source, [overlayOn(0)])).rejects.toThrow('Overlay page 0 is out of range');
  });

  describe.each(ENCRYPTED_SOURCES)('受 %s 保護的來源', variant => {
    it('提供上傳時的密碼即可載入並疊上簽名，輸出不需密碼', async () => {
      const protectedSource = await readEncryptedSource(variant);
      const output = await createSignedPdf(protectedSource, [overlayOn(1)], { sourcePassword: SOURCE_PASSWORD });
      const pages = await inspectPdf(output);

      expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
      expect(pages[0]?.images).toHaveLength(1);
    });

    it('沒有密碼或密碼錯誤時丟出錯誤', async () => {
      const protectedSource = await readEncryptedSource(variant);

      await expect(createSignedPdf(protectedSource, [overlayOn(1)])).rejects.toThrow();
      await expect(createSignedPdf(protectedSource, [overlayOn(1)], { sourcePassword: 'wrong' })).rejects.toThrow();
    });
  });
});
