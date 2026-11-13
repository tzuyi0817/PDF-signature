import type { Box, Placement } from './types';

const FULL_TURN = 360;

/**
 * 把畫面比例座標換成 PDF 使用者空間的繪製參數。
 *
 * 畫面是 CropBox 依頁面 /Rotate 順時針旋轉後的結果，所以：
 * - 可視寬高在 90／270 度時要對調
 * - 錨點取影像在畫面上的左下角，再依旋轉角度換回使用者空間
 * - 影像本身逆時針轉同樣角度，閱讀器順時針轉回來後才會是正的
 *
 * @param overlay 影像在畫面上的位置與尺寸，為頁面寬高的 0–1 比例，原點在左上
 * @param cropBox 頁面的 CropBox（pt）
 * @param pageRotation 頁面的 /Rotate 角度，必須是 90 的倍數
 */
export function toPlacement(overlay: Box, cropBox: Box, pageRotation: number): Placement {
  const rotate = ((pageRotation % FULL_TURN) + FULL_TURN) % FULL_TURN;
  const isSideways = rotate === 90 || rotate === 270;
  const viewWidth = isSideways ? cropBox.height : cropBox.width;
  const viewHeight = isSideways ? cropBox.width : cropBox.height;
  const width = overlay.width * viewWidth;
  const height = overlay.height * viewHeight;
  /** 影像左下角在畫面上的位置（pt，原點左上、y 向下） */
  const left = overlay.x * viewWidth;
  const bottom = (overlay.y + overlay.height) * viewHeight;
  const right = cropBox.x + cropBox.width;
  const top = cropBox.y + cropBox.height;

  switch (rotate) {
    case 0: {
      return { x: cropBox.x + left, y: top - bottom, width, height, rotate };
    }
    case 90: {
      return { x: cropBox.x + bottom, y: cropBox.y + left, width, height, rotate };
    }
    case 180: {
      return { x: right - left, y: cropBox.y + bottom, width, height, rotate };
    }
    case 270: {
      return { x: right - bottom, y: top - left, width, height, rotate };
    }
    default: {
      throw new Error(`Unsupported page rotation: ${pageRotation}`);
    }
  }
}
