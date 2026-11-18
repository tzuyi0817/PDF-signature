import { createRasterPdf } from '../jspdf';
import { hasOriginalPDF, toPageOverlays } from '../pdf-document';
import { exportSignedPdf } from '../pdf-export';
import type { PDF } from '@/types/pdf';

const PDF_TYPE = 'application/pdf';

/**
 * 產生要下載或分享的簽署後 PDF 檔。
 *
 * - 保有原始檔的文件：在原始檔上疊簽名（文字仍可選取）；這條路失敗時靜默退回轉圖匯出
 * - 此變更前儲存的文件（只有整頁 PNG）：沿用 jsPDF 路徑
 *
 * @param doc 要匯出的文件
 * @param password 下載時設定的密碼，有值才加密
 * @throws 文件沒有任何可匯出的內容，或原始檔連轉圖都失敗時
 */
export async function createDownloadFile(doc: PDF, password?: string): Promise<File> {
  const content = hasOriginalPDF(doc) ? await exportOriginal(doc, password) : await exportLegacy(doc, password);

  return new File([content], `${doc.name}.pdf`, { type: PDF_TYPE });
}

async function exportOriginal(doc: PDF & { data: File }, password?: string): Promise<BlobPart> {
  const { data, overlays = [], password: sourcePassword } = doc;

  try {
    const [source, pageOverlays] = await Promise.all([data.arrayBuffer(), toPageOverlays(overlays)]);

    return await exportSignedPdf(new Uint8Array(source), pageOverlays, { sourcePassword, password });
  } catch {
    // pdf-lib 處理不了的檔案（結構損壞、少見的加密、帶 EXIF 旋轉的照片…）改用轉圖匯出；轉圖與 pdf.js 只在這時才載入
    const { renderSignedPages } = await import('./raster-pages');
    const pages = await renderSignedPages(data, overlays, sourcePassword);
    const pdf = await createRasterPdf(pages, { password });

    return pdf.output('blob');
  }
}

async function exportLegacy({ canvas, width, height }: PDF, password?: string): Promise<BlobPart> {
  if (!canvas?.length) throw new Error('Document has nothing to export');

  const pdf = await createRasterPdf(canvas, { width, height, password });

  return pdf.output('blob');
}
