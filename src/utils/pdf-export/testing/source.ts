import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { degrees, PDFDocument, StandardFonts } from '@cantoo/pdf-lib';

interface PageSpec {
  label: string;
  size: [number, number];
  rotation?: number;
  /** CropBox：[x, y, width, height] */
  cropBox?: [number, number, number, number];
}

export const PAGE_SPECS: PageSpec[] = [
  { label: 'A4 portrait', size: [595.28, 841.89] },
  { label: 'A4 landscape', size: [841.89, 595.28] },
  { label: 'Letter non-A4', size: [612, 792] },
  { label: 'Rotated 90', size: [595.28, 841.89], rotation: 90 },
  { label: 'Rotated 180', size: [595.28, 841.89], rotation: 180 },
  { label: 'Rotated 270', size: [595.28, 841.89], rotation: 270 },
  { label: 'CropBox offset', size: [595.28, 841.89], cropBox: [50, 70, 400, 500] },
];

/** 每頁的可搜尋文字 */
export const PAGE_TEXTS = PAGE_SPECS.map((spec, index) => `Searchable text on page ${index + 1}: ${spec.label}`);

/** fixtures 內受保護來源的密碼（以 qpdf 產生，內容與 createSourcePdf 相同） */
export const SOURCE_PASSWORD = 'upload-pass';
export const ENCRYPTED_SOURCES = ['rc4-128', 'aes-128', 'aes-256'];

export async function createSourcePdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const [index, spec] of PAGE_SPECS.entries()) {
    const page = pdf.addPage(spec.size);

    if (spec.rotation) page.setRotation(degrees(spec.rotation));
    if (spec.cropBox) page.setCropBox(...spec.cropBox);

    page.drawText(PAGE_TEXTS[index] ?? '', { x: 80, y: 300, size: 14, font });
  }

  return pdf.save();
}

export async function readEncryptedSource(variant: string): Promise<Uint8Array> {
  const url = new URL(`../fixtures/source-${variant}.pdf`, import.meta.url);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- variant 只來自 ENCRYPTED_SOURCES 的固定清單
  return new Uint8Array(await readFile(fileURLToPath(url)));
}
