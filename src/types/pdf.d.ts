import type { PDF as P } from '@component-hook/pdf-canvas/vue';

export interface PDF extends P {
  canvas?: Blob[];
  trashDate?: number;
  isUpdate?: boolean;
  height?: number;
  width?: number;
  /** 所屬資料夾 ID，undefined 或空字串表示根目錄 */
  folderId?: string;
}
