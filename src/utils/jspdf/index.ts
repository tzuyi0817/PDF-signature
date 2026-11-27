import { A4_HEIGHT, A4_WIDTH } from '@/constants/common';
import type { jsPDF, jsPDFOptions } from 'jspdf';

/** 帶著自己尺寸（mm）的一頁影像 */
export interface RasterPage {
  image: Blob;
  width: number;
  height: number;
}

export interface RasterPdfOptions {
  /** 沒有自帶尺寸的頁面使用的寬度（mm），預設 A4 */
  width?: number;
  /** 沒有自帶尺寸的頁面使用的高度（mm），預設 A4 */
  height?: number;
  /** 有值才加密輸出；使用者密碼與擁有者密碼相同，開放列印與複製 */
  password?: string;
}

/**
 * 把一組頁面影像組成 PDF：每張影像一頁、鋪滿整頁。
 *
 * jsPDF 體積不小，這裡用動態 import，只有舊格式文件或退回轉圖匯出時才會載入，不進初始 bundle。
 *
 * @param images 依頁碼順序排列的整頁 PNG，可以各自帶尺寸；空缺的項目會略過
 * @param options 頁面尺寸與加密
 */
export async function createRasterPdf(
  images: readonly (Blob | RasterPage | undefined)[],
  { width, height, password }: RasterPdfOptions = {},
): Promise<jsPDF> {
  const { jsPDF: JsPDF } = await import('jspdf');
  const fallbackSize = { width: width || A4_WIDTH, height: height || A4_HEIGHT };
  const pages = images.map(image => (image instanceof Blob ? { image, ...fallbackSize } : image));
  const pdf = new JsPDF({ ...toPageFormat(pages.find(Boolean) ?? fallbackSize), ...toEncryption(password) });
  let isFirstPage = true;

  for (const page of pages) {
    if (!page) continue;

    if (!isFirstPage) {
      const { format, orientation } = toPageFormat(page);

      pdf.addPage(format, orientation);
    }

    await drawPage(pdf, page.image);
    isFirstPage = false;
  }

  return pdf;
}

async function drawPage(pdf: jsPDF, blob: Blob) {
  const { width, height } = pdf.internal.pageSize;
  const arrayBuffer = await blobToArrayBuffer(blob);

  pdf.addImage(new Uint8Array(arrayBuffer), 'PNG', 0, 0, width, height, undefined, 'SLOW');
}

function toPageFormat({ width, height }: Pick<RasterPage, 'width' | 'height'>) {
  return {
    orientation: width > height ? 'l' : 'p',
    unit: 'mm',
    format: [width, height],
    compress: true,
  } satisfies jsPDFOptions;
}

function toEncryption(password?: string): jsPDFOptions {
  if (!password) return {};

  return { encryption: { userPassword: password, ownerPassword: password, userPermissions: ['print', 'copy'] } };
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
