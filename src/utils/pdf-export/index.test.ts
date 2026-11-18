import { describe, expect, it } from 'vitest';
import { inspectPdf } from './testing/inspect';
import { createPng } from './testing/png';
import { createSourcePdf, PAGE_TEXTS } from './testing/source';
import { exportSignedPdf } from './index';

describe('exportSignedPdf', () => {
  it('動態載入匯出模組並回傳簽署後的 PDF', async () => {
    const source = await createSourcePdf();
    const output = await exportSignedPdf(source, [
      { page: 1, image: createPng(120, 40), x: 0.1, y: 0.2, width: 0.3, height: 0.1 },
    ]);
    const pages = await inspectPdf(output);

    expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
    expect(pages[0]?.images).toHaveLength(1);
  });
});
