import { exportSignedPdf, removePdfPassword, type PageOverlay } from '../pdf-export';
import type { PDF, StoredOverlay } from '@/types/pdf';
import type { ExportOverlayOptions, FabricOverlay } from '@component-hook/pdf-canvas/vue';

/** overlay 的匯出解析度；用 dpi 而不是倍率，手機與桌機才會得到相同的解析度 */
export const OVERLAY_DPI = 300;

/** 能匯出簽名 overlay 的頁面（pdf-canvas 的元件實例） */
interface OverlayPage {
  exportOverlay: (options?: ExportOverlayOptions) => Promise<FabricOverlay | null>;
}

/** 文件是否保有原始檔；此變更前儲存的文件只有整頁 PNG，回傳 false */
export function hasOriginalPDF(pdf: PDF): pdf is PDF & { data: File } {
  return Boolean(pdf.data);
}

/**
 * 上傳時輸入過密碼的檔案，解除密碼保護後再儲存，之後重開、預覽、匯出都不必再帶密碼，也不用保存密碼。
 *
 * pdf-lib 解不開時不擋上傳：保留原始檔，並把密碼記在文件上。
 *
 * @param pdf 上傳後的文件
 * @param password 上傳時輸入的密碼，沒輸入過為空字串
 */
export async function unlockOriginal<T extends PDF>(pdf: T, password: string): Promise<T> {
  const { data } = pdf;

  if (!password || !data) return pdf;

  try {
    const source = new Uint8Array(await data.arrayBuffer());
    const unlocked = await removePdfPassword(source, password);

    return { ...pdf, data: new File([unlocked], data.name, { type: data.type, lastModified: data.lastModified }) };
  } catch {
    return { ...pdf, password };
  }
}

/**
 * 匯出每一頁的簽名 overlay。沒有簽名的頁不會出現在結果裡。
 *
 * @param pages 依頁碼順序排列的頁面
 */
export async function collectOverlays(pages: readonly OverlayPage[]): Promise<StoredOverlay[]> {
  const exported = await Promise.all(pages.map(page => page.exportOverlay({ dpi: OVERLAY_DPI })));

  return exported.flatMap((overlay, index) => {
    if (!overlay) return [];

    const { blob, x, y, width, height } = overlay;

    return [{ page: index + 1, x, y, width, height, image: blob }];
  });
}

/** 把儲存的 overlay 轉成匯出模組用的格式（影像從 Blob 讀成位元組） */
export function toPageOverlays(overlays: readonly StoredOverlay[]): Promise<PageOverlay[]> {
  return Promise.all(
    overlays.map(async ({ image, ...rest }) => ({ ...rest, image: new Uint8Array(await image.arrayBuffer()) })),
  );
}

/**
 * 產生重新編輯用的底圖：原始檔加上既有的 overlay。
 *
 * 既有的簽名畫在底圖裡，在簽名頁上看得到但動不了；儲存的原始檔與 overlay 都不會被改動。
 * 沒有 overlay 也沒有保留密碼時不需要底圖，回傳 `null`，直接用原始檔即可。
 * 底圖一律是 PDF：原始檔是圖片時，匯出模組會把它包成單頁 PDF。
 *
 * @param pdf 保有原始檔的文件
 */
export async function createEditingBackground(pdf: PDF & { data: File }): Promise<File | null> {
  const { data, overlays = [], password } = pdf;

  if (overlays.length === 0 && !password) return null;

  const [source, pageOverlays] = await Promise.all([data.arrayBuffer(), toPageOverlays(overlays)]);
  const output = await exportSignedPdf(new Uint8Array(source), pageOverlays, { sourcePassword: password });

  return new File([output], data.name, { type: 'application/pdf' });
}

/** 簽名頁要顯示的檔案：重新編輯時是底圖，否則是原始檔 */
export function toSigningFile(pdf: PDF): PDF {
  return pdf.background ? { ...pdf, data: pdf.background } : pdf;
}

/** 存回清單用的文件：拿掉只在編輯期間使用的底圖 */
export function toStoredDocument(pdf: PDF): PDF {
  const stored = { ...pdf };

  delete stored.background;

  return stored;
}
