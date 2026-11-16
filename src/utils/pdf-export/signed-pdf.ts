import { degrees, PDFDocument, PDFInvalidObject, PDFRef } from '@cantoo/pdf-lib';
import { toPlacement } from './placement';
import type { PageOverlay, SignedPdfOptions } from './types';

/**
 * 加密輸出的權限：沿用 jsPDF 路徑的列印與複製。
 * 另外開放無障礙擷取，否則 AES 加密會擋掉螢幕閱讀器（舊的 RC4-40 沒有這個限制）。
 */
const DOWNLOAD_PERMISSIONS = {
  printing: 'highResolution',
  copying: true,
  contentAccessibility: true,
} as const;

const XREF_STREAM = /\/Type\s*\/XRef\b/;
const ENCRYPT_REF = /\/Encrypt\s+(\d+)\s+(\d+)\s+R/;
const INFO_REF = /\/Info\s+(\d+)\s+(\d+)\s+R/;

/**
 * 在原始 PDF 上疊上簽名 overlay，回傳簽署後的 PDF 位元組。
 *
 * 原始頁面內容不會被改寫，所以文字仍可選取與搜尋，頁面尺寸與旋轉也維持原樣。
 * 同一頁可以有多層 overlay，依陣列順序由下往上畫。
 *
 * @param source 原始 PDF 位元組，不會被修改
 * @param overlays 各頁的簽名 overlay
 * 有給 `password` 時以 AES-256 加密，使用者密碼與擁有者密碼相同。
 *
 * @param options 匯出選項
 * @param options.sourcePassword 原始 PDF 受保護時，上傳時輸入的密碼
 * @param options.password 下載時設定的密碼，有值才加密
 * @throws 來源受保護而密碼缺漏或錯誤、或 overlay 的頁碼超出範圍時
 */
export async function createSignedPdf(
  source: Uint8Array,
  overlays: readonly PageOverlay[],
  { sourcePassword, password }: SignedPdfOptions = {},
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(source, { password: sourcePassword });
  const pages = pdf.getPages();

  for (const overlay of overlays) {
    const page = pages[overlay.page - 1];

    if (!page) throw new RangeError(`Overlay page ${overlay.page} is out of range`);

    const image = await pdf.embedPng(overlay.image);
    const { rotate, ...box } = toPlacement(overlay, page.getCropBox(), page.getRotation().angle);

    page.drawImage(image, { ...box, rotate: degrees(rotate) });
  }

  if (password) {
    pdf.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: DOWNLOAD_PERMISSIONS,
    });
  }

  return pdf.save();
}

function toRef(match: RegExpExecArray | null) {
  return match ? PDFRef.of(Number(match[1]), Number(match[2])) : null;
}

/**
 * 清掉解密後殘留的舊交叉參照串流與加密字典。
 *
 * pdf-lib 解密時會把來源的交叉參照串流留成一個無法解析的物件，裡面還指著舊的加密字典；
 * 不清掉的話，存出來的檔案之後再被 pdf-lib 載入會被當成加密檔而失敗。
 * 文件資訊（Info）的指標也只留在那個物件裡，這裡一併接回去。
 */
function dropStaleEncryption({ context }: PDFDocument) {
  const decoder = new TextDecoder('latin1');

  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFInvalidObject)) continue;

    const bytes = new Uint8Array(object.sizeInBytes());

    object.copyBytesInto(bytes, 0);

    const text = decoder.decode(bytes);

    if (!XREF_STREAM.test(text)) continue;

    const encryptRef = toRef(ENCRYPT_REF.exec(text));
    const infoRef = toRef(INFO_REF.exec(text));

    if (encryptRef) context.delete(encryptRef);

    if (infoRef && !context.trailerInfo.Info) {
      context.trailerInfo.Info = infoRef;
    }

    context.delete(ref);
  }
}

/**
 * 解除 PDF 的密碼保護，回傳不加密的 PDF 位元組。
 *
 * 頁面內容只解密、不重新編碼；文件資訊與修改日期維持原樣。
 * 回傳前會確認結果不帶密碼也能再被載入，之後匯出才不會失敗。
 *
 * @param source 受密碼保護的 PDF 位元組，不會被修改
 * @param password 使用者上傳時輸入的密碼
 * @throws 密碼錯誤、pdf-lib 無法解析，或解除後的檔案無法再載入時
 */
export async function removePdfPassword(source: Uint8Array, password: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(source, { password, updateMetadata: false });

  dropStaleEncryption(pdf);

  const output = await pdf.save();

  await PDFDocument.load(output, { updateMetadata: false });

  return output;
}
