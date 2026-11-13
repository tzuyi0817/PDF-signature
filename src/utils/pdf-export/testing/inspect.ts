import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { Box } from '../types';

type Matrix = [number, number, number, number, number, number];

export interface PageReport {
  text: string;
  /** 未旋轉的可視範圍（CropBox）尺寸 */
  width: number;
  height: number;
  rotation: number;
  /** 每張影像在畫面上的外框：頁面寬高的 0–1 比例，原點在左上 */
  images: Box[];
  /** 畫面上的頁面尺寸（pt），已套用旋轉 */
  viewWidth: number;
  viewHeight: number;
}

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const UNIT_SQUARE: [number, number][] = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

function apply([a, b, c, d, e, f]: Matrix, [x, y]: [number, number]): [number, number] {
  return [a * x + c * y + e, b * x + d * y + f];
}

/** 回傳「先套 inner 再套 outer」的合成矩陣 */
function compose(outer: Matrix, inner: Matrix): Matrix {
  const [a, b, c, d, e, f] = outer;
  const [a2, b2, c2, d2, e2, f2] = inner;

  return [a * a2 + c * b2, b * a2 + d * b2, a * c2 + c * d2, b * c2 + d * d2, a * e2 + c * f2 + e, b * e2 + d * f2 + f];
}

function isMatrix(value: unknown): value is Matrix {
  return Array.isArray(value) && value.length === 6 && value.every(item => typeof item === 'number');
}

/** 追蹤內容串流的座標轉換，算出每張影像經頁面旋轉與 CropBox 後在畫面上的外框 */
function findImages(fnArray: number[], argsArray: unknown[], viewTransform: Matrix, width: number, height: number) {
  const stack: Matrix[] = [];
  const images: Box[] = [];
  let matrix = IDENTITY;

  for (const [index, fn] of fnArray.entries()) {
    const args = argsArray[index];

    if (fn === OPS.save) stack.push(matrix);
    if (fn === OPS.restore) matrix = stack.pop() ?? IDENTITY;
    if (fn === OPS.transform && isMatrix(args)) matrix = compose(matrix, args);
    if (fn !== OPS.paintImageXObject) continue;

    const imageMatrix = compose(viewTransform, matrix);
    const corners = UNIT_SQUARE.map(corner => apply(imageMatrix, corner));
    const xs = corners.map(([x]) => x);
    const ys = corners.map(([, y]) => y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);

    images.push({
      x: left / width,
      y: top / height,
      width: (Math.max(...xs) - left) / width,
      height: (Math.max(...ys) - top) / height,
    });
  }

  return images;
}

/** 用 pdf.js（與 app 相同的渲染引擎）讀回 PDF 的每一頁。密碼錯誤時會丟 PasswordException。 */
export async function inspectPdf(bytes: Uint8Array, password?: string): Promise<PageReport[]> {
  const doc = await getDocument({ data: new Uint8Array(bytes), password, verbosity: 0 }).promise;

  try {
    const reports: PageReport[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const [textContent, operators] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
      const unrotated = page.getViewport({ scale: 1, rotation: 0 });
      const viewport = page.getViewport({ scale: 1 });
      const viewTransform = isMatrix(viewport.transform) ? viewport.transform : IDENTITY;

      reports.push({
        text: textContent.items.map(item => ('str' in item ? item.str : '')).join(''),
        width: unrotated.width,
        height: unrotated.height,
        rotation: page.rotate,
        images: findImages(operators.fnArray, operators.argsArray, viewTransform, viewport.width, viewport.height),
        viewWidth: viewport.width,
        viewHeight: viewport.height,
      });
    }

    return reports;
  } finally {
    await doc.destroy();
  }
}
