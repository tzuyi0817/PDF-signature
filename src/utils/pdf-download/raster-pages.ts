import { getDocument, PDFWorker } from 'pdfjs-dist';
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';
import { canvasToFile } from '../image';
import { toImagePageSize } from '../pdf-export/placement';
import type { RasterPage } from '../jspdf';
import type { StoredOverlay } from '@/types/pdf';

/** 轉圖倍率：PDF 的 1pt 對應幾個像素。2 約等於 144 dpi，文字清楚而檔案不至於過大 */
const RENDER_SCALE = 2;
const POINTS_TO_MM = 25.4 / 72;

/**
 * 把原始檔的每一頁轉成影像並畫上簽名 overlay，供 jsPDF 組成 PDF。
 *
 * 這是匯出的退路：輸出是整頁影像，文字不能再選取。只能在瀏覽器執行（需要 canvas 與 Web Worker）。
 *
 * @param file 原始檔（PDF、PNG 或 JPEG）
 * @param overlays 簽名 overlay
 * @param password 原始 PDF 受保護時的密碼
 * @throws 原始檔無法開啟或無法繪製時
 */
export function renderSignedPages(
  file: File,
  overlays: readonly StoredOverlay[],
  password?: string,
): Promise<RasterPage[]> {
  return file.type.startsWith('image/') ? renderImage(file, overlays) : renderPdf(file, overlays, password);
}

async function renderPdf(file: File, overlays: readonly StoredOverlay[], password?: string): Promise<RasterPage[]> {
  const worker: PDFWorker = PDFWorker.fromPort({ port: new PdfjsWorker() });
  const loadingTask = getDocument({ data: await file.arrayBuffer(), password, worker });

  try {
    const pdf = await loadingTask.promise;
    const pages: RasterPage[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const { canvas, context } = createCanvas(viewport.width, viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;
      pages.push(
        await toRasterPage(canvas, context, overlays, pageNumber, {
          width: viewport.width / RENDER_SCALE,
          height: viewport.height / RENDER_SCALE,
        }),
      );
    }

    return pages;
  } finally {
    await loadingTask.destroy();
    worker.destroy();
  }
}

/** 圖片原始檔：瀏覽器解碼時會套用 EXIF 方向，與簽名頁上看到的一致 */
async function renderImage(file: File, overlays: readonly StoredOverlay[]): Promise<RasterPage[]> {
  const bitmap = await createImageBitmap(file);

  try {
    const { canvas, context } = createCanvas(bitmap.width, bitmap.height);

    context.drawImage(bitmap, 0, 0);

    return [await toRasterPage(canvas, context, overlays, 1, toImagePageSize(bitmap.width, bitmap.height))];
  } finally {
    bitmap.close();
  }
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas 2D context is not available');

  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);

  return { canvas, context };
}

/**
 * 在畫好原始頁的 canvas 上依序疊上該頁的 overlay，輸出成一頁影像。
 *
 * @param canvas 已畫好原始頁的 canvas
 * @param context canvas 的 2D context
 * @param overlays 整份文件的 overlay
 * @param pageNumber 這一頁的頁碼，從 1 開始
 * @param size 這一頁的尺寸（pt）
 * @param size.width 寬
 * @param size.height 高
 */
async function toRasterPage(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  overlays: readonly StoredOverlay[],
  pageNumber: number,
  size: { width: number; height: number },
): Promise<RasterPage> {
  for (const overlay of overlays) {
    if (overlay.page !== pageNumber) continue;

    const bitmap = await createImageBitmap(overlay.image);

    context.drawImage(
      bitmap,
      overlay.x * canvas.width,
      overlay.y * canvas.height,
      overlay.width * canvas.width,
      overlay.height * canvas.height,
    );
    bitmap.close();
  }

  return {
    image: await canvasToFile(canvas),
    width: size.width * POINTS_TO_MM,
    height: size.height * POINTS_TO_MM,
  };
}
