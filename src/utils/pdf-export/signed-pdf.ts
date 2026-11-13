import { degrees, PDFDocument } from '@cantoo/pdf-lib';
import { toPlacement } from './placement';
import type { PageOverlay, SignedPdfOptions } from './types';

/**
 * 在原始 PDF 上疊上簽名 overlay，回傳簽署後的 PDF 位元組。
 *
 * 原始頁面內容不會被改寫，所以文字仍可選取與搜尋，頁面尺寸與旋轉也維持原樣。
 * 同一頁可以有多層 overlay，依陣列順序由下往上畫。
 *
 * @param source 原始 PDF 位元組，不會被修改
 * @param overlays 各頁的簽名 overlay
 * @throws 來源受保護而密碼缺漏或錯誤、或 overlay 的頁碼超出範圍時
 */
export async function createSignedPdf(
  source: Uint8Array,
  overlays: readonly PageOverlay[],
  { sourcePassword }: SignedPdfOptions = {},
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(source, { password: sourcePassword });
  const pages = pdf.getPages();

  for (const overlay of overlays) {
    const page = pages[overlay.page - 1];

    if (!page) throw new RangeError(`Overlay page ${overlay.page} is out of range`);

    const image = await pdf.embedPng(overlay.image);
    const { rotate, ...box } = toPlacement(overlay, page.getCropBox(), page.getRotation().angle);

    page.drawImage(image, { ...box, rotate: degrees(rotate) });
  }

  return pdf.save();
}
