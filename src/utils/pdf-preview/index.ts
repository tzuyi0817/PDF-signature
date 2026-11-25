import { getDocument, PDFWorker } from 'pdfjs-dist';
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';
import { readPageSizes, type PageSize } from './pages';

export { toPixelWidth, type PageSize } from './pages';

/** 已開啟、可逐頁渲染的預覽文件 */
export interface PreviewDocument {
  /** 每一頁在畫面上的尺寸（pt），依頁碼順序 */
  pages: readonly PageSize[];
  /**
   * 把一頁畫到 canvas 上；canvas 的像素尺寸會依 `pixelWidth` 與頁面比例重設。
   * 同一個 canvas 同時只能有一次渲染。
   *
   * @param pageNumber 頁碼，從 1 開始
   * @param canvas 目標 canvas
   * @param pixelWidth canvas 的像素寬
   * @param signal 中止訊號；頁面離開畫面時用來取消還沒畫完的渲染
   * @returns 畫完為 `true`，被中止為 `false`
   */
  renderPage: (
    pageNumber: number,
    canvas: HTMLCanvasElement,
    pixelWidth: number,
    signal?: AbortSignal,
  ) => Promise<boolean>;
  /** 關閉文件並結束 worker */
  destroy: () => Promise<void>;
}

/**
 * 開啟原始 PDF 供完成頁預覽。
 *
 * 整份文件只載入一次、共用一個 worker，各頁需要時才渲染。只能在瀏覽器執行（需要 canvas 與 Web Worker）。
 *
 * @param file 原始 PDF
 * @param password 原始 PDF 受保護時的密碼
 * @throws 原始檔無法開啟時
 */
export async function openPreview(file: File, password?: string): Promise<PreviewDocument> {
  const worker: PDFWorker = PDFWorker.fromPort({ port: new PdfjsWorker() });
  const loadingTask = getDocument({ data: await file.arrayBuffer(), password, worker });

  async function destroy() {
    await loadingTask.destroy();
    worker.destroy();
  }

  try {
    const pdf = await loadingTask.promise;
    const pages = await readPageSizes(pdf);

    return {
      pages,
      async renderPage(pageNumber, canvas, pixelWidth, signal) {
        const page = await pdf.getPage(pageNumber);

        if (signal?.aborted) return false;

        const context = canvas.getContext('2d');

        if (!context) throw new Error('Canvas 2D context is not available');

        const viewport = page.getViewport({ scale: pixelWidth / page.getViewport({ scale: 1 }).width });

        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        const task = page.render({ canvasContext: context, viewport });
        const cancel = () => task.cancel();

        signal?.addEventListener('abort', cancel, { once: true });

        try {
          await task.promise;

          return true;
        } catch (error) {
          if (signal?.aborted) return false;

          throw error;
        } finally {
          signal?.removeEventListener('abort', cancel);
        }
      },
      destroy,
    };
  } catch (error) {
    await destroy();

    throw error;
  }
}

/** 釋放 canvas 佔用的像素記憶體；頁面離開畫面時呼叫 */
export function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}
