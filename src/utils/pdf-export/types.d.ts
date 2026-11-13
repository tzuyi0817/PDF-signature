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
