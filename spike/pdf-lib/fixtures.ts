import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { degrees, PDFDocument, StandardFonts } from '@cantoo/pdf-lib';

export const OUT_DIR = path.join(import.meta.dirname, 'out');
export const SOURCE_PASSWORD = 'upload-pass';
export const OWNER_PASSWORD = 'owner-pass';

interface PageSpec {
  label: string;
  size: [number, number];
  rotation?: number;
  /** CropBox：[x, y, width, height]，原點不在 (0, 0) 用來驗證位移 */
  cropBox?: [number, number, number, number];
}

/** 每一頁代表票上要求涵蓋的一種版面 */
export const PAGE_SPECS: PageSpec[] = [
  { label: 'A4 portrait', size: [595.28, 841.89] },
  { label: 'A4 landscape', size: [841.89, 595.28] },
  { label: 'Letter non-A4', size: [612, 792] },
  { label: 'Rotated 90', size: [595.28, 841.89], rotation: 90 },
  { label: 'Rotated 180', size: [595.28, 841.89], rotation: 180 },
  { label: 'Rotated 270', size: [595.28, 841.89], rotation: 270 },
  { label: 'CropBox offset', size: [595.28, 841.89], cropBox: [50, 70, 400, 500] },
];

/** 來源加密型態，對應 qpdf 的參數 */
export const ENCRYPTED_VARIANTS = [
  { name: 'rc4-128', args: ['--bits=128', '--use-aes=n'], weak: true },
  { name: 'aes-128', args: ['--bits=128', '--use-aes=y'], weak: false },
  { name: 'aes-256', args: ['--bits=256'], weak: false },
] as const;

/** 每頁可搜尋的文字，驗證時用來比對輸出是否仍可抽取 */
export function pageText(index: number, label: string) {
  return `Searchable text on page ${index + 1}: ${label}`;
}

export function fixturePath(name: string) {
  return path.join(OUT_DIR, `${name}.pdf`);
}

async function createSourcePdf() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const [index, spec] of PAGE_SPECS.entries()) {
    const page = pdf.addPage(spec.size);

    if (spec.rotation) page.setRotation(degrees(spec.rotation));
    if (spec.cropBox) page.setCropBox(...spec.cropBox);

    page.drawText(pageText(index, spec.label), { x: 80, y: 300, size: 14, font });
  }

  return pdf.save();
}

function encryptWithQpdf(source: string, variant: (typeof ENCRYPTED_VARIANTS)[number]) {
  const target = fixturePath(`source-${variant.name}`);
  const weakArgs = variant.weak ? ['--allow-weak-crypto'] : [];

  // eslint-disable-next-line sonarjs/no-os-command-from-path -- spike 腳本只在開發機執行，qpdf 由 Homebrew 安裝
  execFileSync('qpdf', [
    ...weakArgs,
    '--encrypt',
    `--user-password=${SOURCE_PASSWORD}`,
    `--owner-password=${OWNER_PASSWORD}`,
    ...variant.args,
    '--',
    source,
    target,
  ]);
}

/** 產生未加密來源，再用 qpdf（獨立於 pdf-lib 的實作）產生三種加密來源 */
export async function generateFixtures() {
  const source = fixturePath('source');

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(source, await createSourcePdf());

  for (const variant of ENCRYPTED_VARIANTS) {
    encryptWithQpdf(source, variant);
  }
}
