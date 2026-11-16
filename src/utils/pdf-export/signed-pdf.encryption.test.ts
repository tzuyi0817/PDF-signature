import { PDFDocument } from '@cantoo/pdf-lib';
import { beforeAll, describe, expect, it } from 'vitest';
import { createSignedPdf, removePdfPassword } from './signed-pdf';
import { inspectPdf, readPermissions } from './testing/inspect';
import { createPng } from './testing/png';
import {
  createSourcePdf,
  ENCRYPTED_SOURCES,
  PAGE_SPECS,
  PAGE_TEXTS,
  readEncryptedSource,
  SOURCE_PASSWORD,
} from './testing/source';
import type { PageOverlay } from './types';

const PASSWORD = 'download-pass';
const IMAGE = createPng(120, 40);
const OVERLAYS: PageOverlay[] = PAGE_SPECS.map((_, index) => ({
  page: index + 1,
  image: IMAGE,
  x: 0.1,
  y: 0.2,
  width: 0.3,
  height: 0.1,
}));
/** 加密 fixtures 產生於 2026-11-13，文件資訊裡的修改日期必定早於這個時間 */
const FIXTURES_CREATED_BEFORE = Date.parse('2026-11-14T00:00:00Z');
/** 每層 overlay 允許的額外位元組：影像物件、透明遮罩物件與繪製指令 */
const OVERHEAD_PER_OVERLAY = 1024;
/** 整份文件重新序列化允許的額外位元組 */
const DOCUMENT_OVERHEAD = 2048;

describe('createSignedPdf 的加密與輸出大小', () => {
  let source: Uint8Array;

  beforeAll(async () => {
    source = await createSourcePdf();
  });

  it('給了密碼時，輸出沒有密碼或密碼錯誤都打不開', async () => {
    const output = await createSignedPdf(source, OVERLAYS, { password: PASSWORD });

    await expect(inspectPdf(output)).rejects.toThrow('No password given');
    await expect(inspectPdf(output, 'wrong')).rejects.toThrow('Incorrect Password');
  });

  it('給了密碼時，用該密碼可開啟且文字與簽名都在', async () => {
    const output = await createSignedPdf(source, OVERLAYS, { password: PASSWORD });
    const pages = await inspectPdf(output, PASSWORD);

    expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
    expect(pages.every(page => page.images.length === 1)).toBe(true);
  });

  it('加密輸出只開放列印、複製與無障礙擷取，不開放修改', async () => {
    const output = await createSignedPdf(source, OVERLAYS, { password: PASSWORD });

    await expect(readPermissions(output, PASSWORD)).resolves.toEqual({
      print: true,
      copy: true,
      copyForAccessibility: true,
      modify: false,
      annotate: false,
      fillForms: false,
      assemble: false,
    });
  });

  it.each([
    ['沒有給密碼', undefined],
    ['密碼是空字串', ''],
  ])('%s時，輸出不加密', async (_, password) => {
    const output = await createSignedPdf(source, OVERLAYS, { password });

    await expect(inspectPdf(output)).resolves.toHaveLength(PAGE_SPECS.length);
    await expect(readPermissions(output)).resolves.toBeNull();
  });

  it('來源受保護但下載時沒設密碼，輸出不加密', async () => {
    const protectedSource = await readEncryptedSource('aes-256');
    const output = await createSignedPdf(protectedSource, OVERLAYS, { sourcePassword: SOURCE_PASSWORD });

    await expect(readPermissions(output)).resolves.toBeNull();
  });

  it('來源受保護且下載時另設密碼，輸出只能用新密碼開啟', async () => {
    const protectedSource = await readEncryptedSource('aes-256');
    const output = await createSignedPdf(protectedSource, OVERLAYS, {
      sourcePassword: SOURCE_PASSWORD,
      password: PASSWORD,
    });

    await expect(inspectPdf(output, SOURCE_PASSWORD)).rejects.toThrow('Incorrect Password');
    await expect(inspectPdf(output, PASSWORD)).resolves.toHaveLength(PAGE_SPECS.length);
  });

  it('輸出大小不超過來源加上所有簽名影像與少量開銷', async () => {
    const output = await createSignedPdf(source, OVERLAYS);
    const imageBytes = OVERLAYS.reduce((total, overlay) => total + overlay.image.length, 0);
    const limit = source.length + imageBytes + OVERLAYS.length * OVERHEAD_PER_OVERLAY + DOCUMENT_OVERHEAD;

    expect(output.length).toBeLessThanOrEqual(limit);
  });
});

describe('removePdfPassword', () => {
  it.each(ENCRYPTED_SOURCES)('%s 來源解除密碼後不需密碼即可開啟，內容與頁面不變', async variant => {
    const output = await removePdfPassword(await readEncryptedSource(variant), SOURCE_PASSWORD);
    const pages = await inspectPdf(output);

    expect(pages.map(page => page.text)).toEqual(PAGE_TEXTS);
    expect(pages.map(({ width, height, rotation }) => ({ width, height, rotation }))).toEqual(
      (await inspectPdf(await readEncryptedSource(variant), SOURCE_PASSWORD)).map(({ width, height, rotation }) => ({
        width,
        height,
        rotation,
      })),
    );
    await expect(readPermissions(output)).resolves.toBeNull();
  });

  it('密碼錯誤時丟出錯誤', async () => {
    await expect(removePdfPassword(await readEncryptedSource('aes-256'), 'wrong')).rejects.toThrow();
  });

  it.each(ENCRYPTED_SOURCES)('%s 來源解除密碼後，pdf-lib 之後不帶密碼也能再載入並疊上簽名', async variant => {
    const unlocked = await removePdfPassword(await readEncryptedSource(variant), SOURCE_PASSWORD);
    const output = await createSignedPdf(unlocked, OVERLAYS);

    await expect(inspectPdf(output)).resolves.toHaveLength(PAGE_SPECS.length);
  });

  it.each(ENCRYPTED_SOURCES)('%s 來源解除密碼後，檔案裡不殘留原本的加密資訊', async variant => {
    const output = await removePdfPassword(await readEncryptedSource(variant), SOURCE_PASSWORD);

    expect(new TextDecoder('latin1').decode(output)).not.toContain('/Encrypt');
  });

  it('保留文件資訊，修改日期不會變成現在', async () => {
    const output = await removePdfPassword(await readEncryptedSource('aes-256'), SOURCE_PASSWORD);
    const reloaded = await PDFDocument.load(output, { updateMetadata: false });

    expect(reloaded.getProducer()).toBeDefined();
    expect(reloaded.getModificationDate()?.getTime()).toBeLessThan(FIXTURES_CREATED_BEFORE);
  });
});
