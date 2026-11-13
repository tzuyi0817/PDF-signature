/** 矩形：位置與尺寸 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 影像在 PDF 使用者空間的繪製參數（單位 pt，原點在左下） */
export interface Placement extends Box {
  /** 逆時針旋轉角度，用來抵消頁面的 /Rotate */
  rotate: number;
}

/** 一頁上的一層簽名 overlay；位置與尺寸是畫面上頁面寬高的 0–1 比例，原點在左上 */
export interface PageOverlay extends Box {
  /** 頁碼，從 1 開始 */
  page: number;
  /** 透明底的 PNG 影像 */
  image: Uint8Array;
}

export interface SignedPdfOptions {
  /** 原始 PDF 受密碼保護時，使用者上傳時輸入的密碼 */
  sourcePassword?: string;
  /** 下載時使用者設定的密碼；有值才加密輸出，與原始 PDF 是否受保護無關 */
  password?: string;
}
