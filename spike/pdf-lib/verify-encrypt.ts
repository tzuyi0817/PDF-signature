/**
 * Spike #135 區塊 2：驗證票上第 2 項（加密輸出）。
 * 執行：node spike/pdf-lib/verify-encrypt.ts
 * 需先跑過 verify-basic.ts 產生 fixtures。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, type EncryptionAlgorithm } from '@cantoo/pdf-lib';
import { jsPDF } from 'jspdf';
import { fixturePath, PAGE_SPECS, pageText, SOURCE_PASSWORD } from './fixtures.ts';
import { inspectPdf, openError } from './inspect.ts';
import { createSignaturePng } from './png.ts';

interface Check {
  name: string;
  pass: boolean;
  detail: string;
}

interface Scenario {
  output: string;
  source: string;
  sourcePassword?: string;
  algorithm: EncryptionAlgorithm;
}

const DOWNLOAD_PASSWORD = 'download-pass';
const EXPECTED_TEXT = PAGE_SPECS.map((spec, index) => pageText(index, spec.label));
/** qpdf --show-encryption 的權限列：現況語意是只開放列印與複製 */
const EXPECTED_PERMISSIONS: Record<string, string> = {
  'print low resolution': 'allowed',
  'print high resolution': 'allowed',
  'extract for any purpose': 'allowed',
  'modify anything': 'not allowed',
  'modify annotations': 'not allowed',
  'modify forms': 'not allowed',
  'modify document assembly': 'not allowed',
};

const SCENARIOS: Scenario[] = [
  { output: 'encrypted-aes-256', source: 'source', algorithm: 'AES-256' },
  { output: 'encrypted-aes-128', source: 'source', algorithm: 'AES-128' },
  {
    output: 'encrypted-aes-256-from-protected',
    source: 'source-aes-256',
    sourcePassword: SOURCE_PASSWORD,
    algorithm: 'AES-256',
  },
];

/** 疊圖後加密：沿用現況 jsPDF 的語意，使用者與擁有者密碼相同、允許列印與複製 */
async function signAndEncrypt({ source, sourcePassword, algorithm }: Scenario) {
  const pdf = await PDFDocument.load(readFileSync(fixturePath(source)), { password: sourcePassword });
  const image = await pdf.embedPng(createSignaturePng(240, 80));

  for (const page of pdf.getPages()) {
    page.drawImage(image, { x: 100, y: 120, width: 120, height: 40 });
  }

  pdf.encrypt({
    userPassword: DOWNLOAD_PASSWORD,
    ownerPassword: DOWNLOAD_PASSWORD,
    permissions: { printing: 'highResolution', copying: true },
    algorithm,
  });

  return pdf.save();
}

/** 用 qpdf（獨立實作）讀出加密參數，回傳 key → value */
function showEncryption(file: string, password: string): Record<string, string> {
  // eslint-disable-next-line sonarjs/no-os-command-from-path -- spike 腳本只在開發機執行，qpdf 由 Homebrew 安裝
  const output = execFileSync('qpdf', ['--show-encryption', `--password=${password}`, file], { encoding: 'utf8' });

  return Object.fromEntries(
    output
      .split('\n')
      .map(line => line.split(/[:=]/))
      .filter((parts): parts is [string, string] => parts.length === 2)
      .map(([key, value]) => [key.trim(), value.trim()]),
  );
}

function diffPermissions(actual: Record<string, string>) {
  return Object.entries(EXPECTED_PERMISSIONS)
    .filter(([key, expected]) => actual[key] !== expected)
    .map(([key, expected]) => `${key}: 預期 ${expected}，實際 ${actual[key] ?? '缺'}`);
}

async function checkScenario(scenario: Scenario): Promise<Check[]> {
  const file = fixturePath(scenario.output);
  const bytes = await signAndEncrypt(scenario);

  writeFileSync(file, bytes);

  const [withoutPassword, wrongPassword, pages] = await Promise.all([
    openError(bytes),
    openError(bytes, 'wrong'),
    inspectPdf(bytes, DOWNLOAD_PASSWORD),
  ]);
  const encryption = showEncryption(file, DOWNLOAD_PASSWORD);
  const mismatches = diffPermissions(encryption);
  const label = `[${scenario.output}]`;

  return [
    { name: `${label} 不給密碼無法開啟`, pass: withoutPassword !== null, detail: withoutPassword ?? '竟然開啟成功' },
    { name: `${label} 密碼錯誤無法開啟`, pass: wrongPassword !== null, detail: wrongPassword ?? '竟然開啟成功' },
    {
      name: `${label} 用密碼開啟且文字仍可抽取`,
      pass: pages.length === EXPECTED_TEXT.length && pages.every((page, index) => page.text === EXPECTED_TEXT[index]),
      detail: `${pages.length} 頁`,
    },
    {
      name: `${label} 權限為列印 + 複製`,
      pass: mismatches.length === 0,
      detail: mismatches.join('；') || `R=${encryption.R} P=${encryption.P}`,
    },
    {
      name: `${label} 加密方式`,
      pass: true,
      detail: `stream 加密方式 ${encryption['stream encryption method']}，無障礙擷取 ${encryption['extract for accessibility']}`,
    },
  ];
}

/** 對照組：現況 jsPDF 路徑產生的加密參數，用來確認「現況權限」的實際內容 */
function describeCurrentJsPdf(): Check {
  const file = fixturePath('baseline-jspdf');
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    encryption: {
      userPassword: DOWNLOAD_PASSWORD,
      ownerPassword: DOWNLOAD_PASSWORD,
      userPermissions: ['print', 'copy'],
    },
  });

  pdf.text('baseline', 20, 20);
  writeFileSync(file, new Uint8Array(pdf.output('arraybuffer')));

  const encryption = showEncryption(file, DOWNLOAD_PASSWORD);
  const allowed = Object.keys(EXPECTED_PERMISSIONS).filter(key => encryption[key] === 'allowed');

  return {
    name: '[對照] 現況 jsPDF 輸出',
    pass: true,
    detail: `R=${encryption.R} P=${encryption.P}（R=2 即 RC4-40），允許：${allowed.join('、')}`,
  };
}

const checks = [describeCurrentJsPdf(), ...(await Promise.all(SCENARIOS.map(checkScenario))).flat()];

for (const { name, pass, detail } of checks) {
  console.info(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

process.exitCode = checks.every(check => check.pass) ? 0 : 1;
