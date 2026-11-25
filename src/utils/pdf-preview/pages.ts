/** 預覽用的像素密度上限；超過 2 的裝置不再放大，canvas 記憶體才不會隨像素密度平方成長 */
export const MAX_PIXEL_RATIO = 2;

/** 一頁在畫面上的尺寸（pt），已套用頁面旋轉與 CropBox */
export interface PageSize {
  width: number;
  height: number;
}

/** 讀取頁面尺寸所需的最小文件介面（pdf.js 的 PDFDocumentProxy 符合） */
interface PageSizeSource {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{ getViewport: (options: { scale: number }) => PageSize }>;
}

/**
 * 讀取每一頁在畫面上的尺寸。只讀頁面資訊、不渲染，用來在頁面畫出來之前先撐出正確比例的佔位。
 *
 * @param pdf 已載入的文件
 */
export function readPageSizes(pdf: PageSizeSource): Promise<PageSize[]> {
  return Promise.all(
    Array.from({ length: pdf.numPages }, async (_, index) => {
      const page = await pdf.getPage(index + 1);
      const { width, height } = page.getViewport({ scale: 1 });

      return { width, height };
    }),
  );
}

/**
 * 換算 canvas 要畫的像素寬。
 *
 * @param displayWidth 頁面在畫面上實際顯示的寬度（CSS px，含版面縮放）
 * @param pixelRatio 裝置像素密度
 */
export function toPixelWidth(displayWidth: number, pixelRatio: number): number {
  const ratio = pixelRatio > 0 ? Math.min(pixelRatio, MAX_PIXEL_RATIO) : 1;

  return Math.round(displayWidth * ratio);
}
