import { A4_HEIGHT, A4_WIDTH } from '@/constants/common';
import { sleep } from '../common';
import type { PDF } from '@/types/pdf';
import type { jsPDF, jsPDFOptions } from 'jspdf';

export interface RasterPdfOptions {
  /** 頁面寬度（mm），預設 A4 */
  width?: number;
  /** 頁面高度（mm），預設 A4 */
  height?: number;
  /** 有值才加密輸出；使用者密碼與擁有者密碼相同，開放列印與複製 */
  password?: string;
  /** 每處理完一頁呼叫一次，參數是已完成的頁數；回傳 Promise 時會等它結束再處理下一頁 */
  onPage?: (done: number) => unknown;
}

/** 下載舊格式文件（只有整頁 PNG、沒有原始檔）。 */
export async function downloadPDF(doc: PDF, setCompleteness?: (value: number) => void, password?: string) {
  const { name, canvas, width, height } = doc;

  if (!canvas) return;

  const pages = canvas.length;
  const pdf = await createRasterPdf(canvas, {
    width,
    height,
    password,
    async onPage(done) {
      setCompleteness?.((done / pages) * 100);
      await sleep(50);
    },
  });

  pdf.save(`${name}.pdf`);
}

/** 把舊格式文件的整頁 PNG 組成 PDF 檔。 */
export async function generatePDF(doc: PDF) {
  const { canvas, name, width, height } = doc;

  if (!canvas) return;

  const pdf = await createRasterPdf(canvas, { width, height });
  const blob = pdf.output('blob');

  return new File([blob], `${name}.pdf`, { type: blob.type });
}

/**
 * 把一組頁面影像組成 PDF：每張影像一頁、鋪滿整頁，所有頁面同一個尺寸。
 *
 * jsPDF 體積不小，這裡用動態 import，只有舊格式文件或退回轉圖匯出時才會載入，不進初始 bundle。
 *
 * @param images 依頁碼順序排列的整頁 PNG；空缺的項目會略過
 * @param options 頁面尺寸、加密與進度回報
 */
export async function createRasterPdf(
  images: readonly (Blob | undefined)[],
  { width, height, password, onPage }: RasterPdfOptions = {},
): Promise<jsPDF> {
  const { jsPDF: JsPDF } = await import('jspdf');
  const pdf = new JsPDF(getOptions(width || A4_WIDTH, height || A4_HEIGHT, password));

  for (const [index, image] of images.entries()) {
    if (image) {
      await setPdf(pdf, image, index === images.length - 1);
    }

    await onPage?.(index + 1);
  }

  return pdf;
}

async function setPdf(pdf: jsPDF, blob: Blob, isLast: boolean) {
  const { width, height } = pdf.internal.pageSize;
  const arrayBuffer = await blobToArrayBuffer(blob);
  const uint8Array = new Uint8Array(arrayBuffer);

  pdf.addImage(uint8Array, 'PNG', 0, 0, width, height, undefined, 'SLOW');

  if (isLast) return;

  pdf.addPage();
}

function getOptions(width: number, height: number, password?: string) {
  const orientation = width > height ? 'l' : 'p';
  const options: jsPDFOptions = {
    orientation,
    unit: 'mm',
    format: [width, height],
    compress: true,
  };

  if (password) {
    options.encryption = {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print', 'copy'],
    };
  }

  return options;
}

export function blobToArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  if (file.arrayBuffer) {
    return file.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      const result = fileReader.result;

      if (!(result instanceof ArrayBuffer)) {
        reject(new Error('Failed to read file as ArrayBuffer.'));
        return;
      }

      resolve(result);
    });
    fileReader.addEventListener('error', reject);
    fileReader.readAsArrayBuffer(file);
  });
}
