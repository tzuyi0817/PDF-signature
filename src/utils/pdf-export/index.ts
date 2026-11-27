import type { PageOverlay, PdfBytes, SignedPdfOptions } from './types';

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
): Promise<PdfBytes> {
  const { createSignedPdf } = await import('./signed-pdf');

  return createSignedPdf(source, overlays, options);
}

/** 解除 PDF 的密碼保護。與 `exportSignedPdf` 一樣動態載入，只有上傳受保護的檔案時才會抓 pdf-lib。 */
export async function removePdfPassword(source: Uint8Array, password: string): Promise<PdfBytes> {
  const module = await import('./signed-pdf');

  return module.removePdfPassword(source, password);
}
