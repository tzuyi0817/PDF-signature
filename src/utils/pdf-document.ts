import { removePdfPassword } from './pdf-export';
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
