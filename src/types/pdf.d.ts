import type { Box } from '@/utils/pdf-export/types';
import type { PDF as P } from '@component-hook/pdf-canvas/vue';

/** 儲存在 IndexedDB 的一層簽名 overlay；位置與尺寸是畫面上頁面寬高的 0–1 比例，原點在左上 */
export interface StoredOverlay extends Box {
  /** 頁碼，從 1 開始 */
  page: number;
  /** 透明底的 PNG 影像 */
  image: Blob;
}

/** 一次簽署要寫入文件的結果 */
export interface SignResult {
  /** 這次簽署新增的 overlay；沒有簽名的頁不會出現 */
  overlays: StoredOverlay[];
  /** 第一頁縮圖 */
  thumbnail: Blob;
}

/**
 * 文件紀錄。
 * `data` 是原始檔，在文件的整個生命週期（列表、封存、垃圾桶）都保留；
 * 此變更前儲存的文件沒有原始檔（`data` 為 `null`），只有 `canvas` 的整頁 PNG。
 */
export interface PDF extends P {
  /** 舊格式：每頁一張含簽名的整頁 PNG；新文件不再寫入 */
  canvas?: Blob[];
  /** 簽名 overlay；同一頁排在後面的項目是後來再次簽署加上的一層 */
  overlays?: StoredOverlay[];
  /** 第一頁縮圖，供檔案列表使用 */
  thumbnail?: Blob;
  trashDate?: number;
  isUpdate?: boolean;
  height?: number;
  width?: number;
  /** 所屬資料夾 ID，undefined 或空字串表示根目錄 */
  folderId?: string;
}
