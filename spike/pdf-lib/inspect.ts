import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface PageReport {
  text: string;
  width: number;
  height: number;
  rotation: number;
  imageCount: number;
}

/**
 * 用 pdf.js（與 app 相同的渲染引擎）讀回 PDF：
 * 逐頁抽文字、量尺寸與旋轉、數影像繪製次數。密碼錯誤時 pdf.js 會丟 PasswordException。
 */
export async function inspectPdf(bytes: Uint8Array, password?: string): Promise<PageReport[]> {
  const doc = await getDocument({ data: new Uint8Array(bytes), password, verbosity: 0 }).promise;

  try {
    const reports: PageReport[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const [textContent, operators] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
      // rotation: 0 取未旋轉的可視範圍（CropBox），旋轉另外記錄
      const { width, height } = page.getViewport({ scale: 1, rotation: 0 });

      reports.push({
        text: textContent.items.map(item => ('str' in item ? item.str : '')).join(''),
        width,
        height,
        rotation: page.rotate,
        imageCount: operators.fnArray.filter(fn => fn === OPS.paintImageXObject).length,
      });
    }

    return reports;
  } finally {
    await doc.destroy();
  }
}

/** 嘗試開啟並回傳錯誤名稱；成功開啟回傳 null */
export async function openError(bytes: Uint8Array, password?: string): Promise<string | null> {
  try {
    await inspectPdf(bytes, password);
    return null;
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
}
