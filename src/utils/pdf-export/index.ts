import type { PageOverlay, SignedPdfOptions } from './types';

export type { Box, PageOverlay, Placement, SignedPdfOptions } from './types';

/**
 * 匯出簽署後的 PDF。
 *
 * pdf-lib 體積不小，這裡用動態 import，讓它只在使用者實際下載或分享時才載入，不進初始 bundle。
 * 呼叫端一律從這個入口匯入，不要直接匯入 `./signed-pdf`。
 */
export async function exportSignedPdf(
  source: Uint8Array,
  overlays: readonly PageOverlay[],
  options?: SignedPdfOptions,
): Promise<Uint8Array> {
  const { createSignedPdf } = await import('./signed-pdf');

  return createSignedPdf(source, overlays, options);
}
