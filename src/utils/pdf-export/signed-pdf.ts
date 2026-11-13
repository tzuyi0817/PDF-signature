import { degrees, PDFDocument } from '@cantoo/pdf-lib';
import { toPlacement } from './placement';
import type { PageOverlay, SignedPdfOptions } from './types';

/**
 * 加密輸出的權限：沿用 jsPDF 路徑的列印與複製。
 * 另外開放無障礙擷取，否則 AES 加密會擋掉螢幕閱讀器（舊的 RC4-40 沒有這個限制）。
 */
const DOWNLOAD_PERMISSIONS = {
  printing: 'highResolution',
  copying: true,
  contentAccessibility: true,
} as const;

/**
 * 在原始 PDF 上疊上簽名 overlay，回傳簽署後的 PDF 位元組。
 *
 * 原始頁面內容不會被改寫，所以文字仍可選取與搜尋，頁面尺寸與旋轉也維持原樣。
 * 同一頁可以有多層 overlay，依陣列順序由下往上畫。
 *
 * @param source 原始 PDF 位元組，不會被修改
 * @param overlays 各頁的簽名 overlay
 * 有給 `password` 時以 AES-256 加密，使用者密碼與擁有者密碼相同。
 *
 * @param options 匯出選項
 * @param options.sourcePassword 原始 PDF 受保護時，上傳時輸入的密碼
 * @param options.password 下載時設定的密碼，有值才加密
 * @throws 來源受保護而密碼缺漏或錯誤、或 overlay 的頁碼超出範圍時
 */
export async function createSignedPdf(
  source: Uint8Array,
  overlays: readonly PageOverlay[],
  { sourcePassword, password }: SignedPdfOptions = {},
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

  if (password) {
    pdf.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: DOWNLOAD_PERMISSIONS,
    });
  }

  return pdf.save();
}
