import { degrees, PDFDocument } from '@cantoo/pdf-lib';

/** pdf-canvas 匯出的 overlay：位置與尺寸是「畫面上看到的頁面」的 0–1 比例，原點在左上 */
export interface PageOverlay {
  /** 頁碼，從 1 開始 */
  page: number;
  png: Uint8Array;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Placement extends Box {
  /** 逆時針旋轉角度，用來抵消頁面的 /Rotate */
  rotate: number;
}

/**
 * 把畫面比例座標換成 PDF 使用者空間的繪製參數。
 *
 * 畫面是 CropBox 依 /Rotate 順時針旋轉後的結果，所以：
 * - 可視寬高在 90／270 度時要對調
 * - 錨點取影像在畫面上的左下角，再依旋轉角度換回使用者空間
 * - 影像本身逆時針轉同樣角度，閱讀器順時針轉回來後才會是正的
 */
export function toPlacement(overlay: Box, cropBox: Box, pageRotation: number): Placement {
  const rotate = ((pageRotation % 360) + 360) % 360;
  const isSideways = rotate === 90 || rotate === 270;
  const viewWidth = isSideways ? cropBox.height : cropBox.width;
  const viewHeight = isSideways ? cropBox.width : cropBox.height;
  const width = overlay.width * viewWidth;
  const height = overlay.height * viewHeight;
  /** 影像左下角在畫面上的位置（pt，原點左上、y 向下） */
  const u = overlay.x * viewWidth;
  const v = (overlay.y + overlay.height) * viewHeight;
  const anchors: Record<number, [number, number]> = {
    0: [cropBox.x + u, cropBox.y + cropBox.height - v],
    90: [cropBox.x + v, cropBox.y + u],
    180: [cropBox.x + cropBox.width - u, cropBox.y + v],
    270: [cropBox.x + cropBox.width - v, cropBox.y + cropBox.height - u],
  };
  const anchor = anchors[rotate];

  if (!anchor) throw new Error(`Unsupported page rotation: ${pageRotation}`);

  return { x: anchor[0], y: anchor[1], width, height, rotate };
}

/** 在原始 PDF 上疊上每頁的 overlay，原始內容不動 */
export async function overlayOnOriginal(source: Uint8Array, overlays: PageOverlay[], password?: string) {
  const pdf = await PDFDocument.load(source, { password });
  const pages = pdf.getPages();

  for (const overlay of overlays) {
    const page = pages[overlay.page - 1];

    if (!page) continue;

    const image = await pdf.embedPng(overlay.png);
    const { rotate, ...box } = toPlacement(overlay, page.getCropBox(), page.getRotation().angle);

    page.drawImage(image, { ...box, rotate: degrees(rotate) });
  }

  return pdf.save();
}
