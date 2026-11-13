/**
 * Spike #135 區塊 1：驗證票上第 1、3 項。
 * 執行：node spike/pdf-lib/verify-basic.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from '@cantoo/pdf-lib';
import {
  ENCRYPTED_VARIANTS,
  fixturePath,
  generateFixtures,
  OWNER_PASSWORD,
  PAGE_SPECS,
  pageText,
  SOURCE_PASSWORD,
} from './fixtures.ts';
import { inspectPdf, openError } from './inspect.ts';
import { createSignaturePng } from './png.ts';

interface Check {
  name: string;
  pass: boolean;
  detail: string;
}

const SIGNATURE = createSignaturePng(240, 80);
const EXPECTED_TEXT = PAGE_SPECS.map((spec, index) => pageText(index, spec.label));

/** 載入來源、在每頁畫一張透明 PNG、存檔。座標先用固定值，對位留給區塊 3。 */
async function overlaySignature(source: Uint8Array, password?: string) {
  const pdf = await PDFDocument.load(source, { password });
  const image = await pdf.embedPng(SIGNATURE);

  for (const page of pdf.getPages()) {
    page.drawImage(image, { x: 100, y: 120, width: 120, height: 40 });
  }

  return { bytes: await pdf.save(), isEncrypted: pdf.isEncrypted };
}

async function loadError(source: Uint8Array, password?: string) {
  try {
    await PDFDocument.load(source, { password });
    return null;
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
}

/** 第 1 項：輸出的頁數、尺寸、旋轉、文字都與來源一致，且每頁多一張影像 */
async function checkPlainOverlay(): Promise<Check[]> {
  const source = readFileSync(fixturePath('source'));
  const { bytes } = await overlaySignature(source);
  const [before, after] = await Promise.all([inspectPdf(source), inspectPdf(bytes)]);

  writeFileSync(fixturePath('signed'), bytes);

  const geometry = (pages: typeof before) => pages.map(({ width, height, rotation }) => ({ width, height, rotation }));

  return [
    {
      name: '頁數與來源相同',
      pass: after.length === before.length,
      detail: `${before.length} → ${after.length}`,
    },
    {
      name: '每頁尺寸與旋轉不變',
      pass: JSON.stringify(geometry(after)) === JSON.stringify(geometry(before)),
      detail: after.map(page => `${page.width}×${page.height}@${page.rotation}`).join(', '),
    },
    {
      name: '每頁文字仍可抽取（可選取／搜尋）',
      pass: after.every((page, index) => page.text === EXPECTED_TEXT[index]),
      detail: `${after.filter((page, index) => page.text === EXPECTED_TEXT[index]).length}/${after.length} 頁相符`,
    },
    {
      name: '每頁新增一張影像',
      pass: after.every((page, index) => page.imageCount === (before[index]?.imageCount ?? 0) + 1),
      detail: after.map(page => page.imageCount).join(', '),
    },
    {
      name: '輸出大小',
      pass: true,
      detail: `來源 ${source.length} bytes → 輸出 ${bytes.length} bytes（PNG ${SIGNATURE.length} bytes）`,
    },
  ];
}

/** 第 3 項：三種加密來源都能用上傳密碼載入；不給或給錯密碼要失敗 */
async function checkEncryptedSource(variant: string): Promise<Check[]> {
  const source = readFileSync(fixturePath(`source-${variant}`));
  const [withoutPassword, wrongPassword] = await Promise.all([loadError(source), loadError(source, 'wrong')]);
  const results: Check[] = [
    {
      name: `[${variant}] 不給密碼載入失敗`,
      pass: withoutPassword !== null,
      detail: withoutPassword ?? '竟然載入成功',
    },
    { name: `[${variant}] 密碼錯誤載入失敗`, pass: wrongPassword !== null, detail: wrongPassword ?? '竟然載入成功' },
  ];

  for (const [role, password] of [
    ['使用者密碼', SOURCE_PASSWORD],
    ['擁有者密碼', OWNER_PASSWORD],
  ] as const) {
    try {
      const { bytes, isEncrypted } = await overlaySignature(source, password);
      const reopenError = await openError(bytes);
      const pages = reopenError ? [] : await inspectPdf(bytes);
      const textKept =
        pages.length === EXPECTED_TEXT.length && pages.every((page, index) => page.text === EXPECTED_TEXT[index]);

      writeFileSync(fixturePath(`signed-from-${variant}-${role === '使用者密碼' ? 'user' : 'owner'}`), bytes);
      results.push(
        {
          name: `[${variant}] ${role}載入、疊圖、存檔`,
          pass: textKept,
          detail: reopenError ?? `文字 ${textKept ? '保留' : '遺失'}，載入後 isEncrypted=${isEncrypted}`,
        },
        {
          name: `[${variant}] ${role}：輸出不需密碼即可開啟`,
          pass: reopenError === null,
          detail: reopenError ?? '輸出未加密',
        },
      );
    } catch (error) {
      results.push({ name: `[${variant}] ${role}載入、疊圖、存檔`, pass: false, detail: String(error) });
    }
  }

  return results;
}

await generateFixtures();

const checks = [
  ...(await checkPlainOverlay()),
  ...(await Promise.all(ENCRYPTED_VARIANTS.map(variant => checkEncryptedSource(variant.name)))).flat(),
];

for (const { name, pass, detail } of checks) {
  console.info(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

process.exitCode = checks.every(check => check.pass) ? 0 : 1;
