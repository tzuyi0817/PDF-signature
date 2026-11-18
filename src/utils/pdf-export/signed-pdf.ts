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

/** A4 的短邊與長邊（pt）；圖片原始檔的頁面會縮放到剛好放進同方向的 A4 */
const A4_SHORT_SIDE = 595.28;
const A4_LONG_SIDE = 841.89;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

const XREF_STREAM = /\/Type\s*\/XRef\b/;
const ENCRYPT_REF = /\/Encrypt\s+(\d+)\s+(\d+)\s+R/;
const INFO_REF = /\/Info\s+(\d+)\s+(\d+)\s+R/;

/**
 * 在原始檔上疊上簽名 overlay，回傳簽署後的 PDF 位元組。
 *
 * 原始頁面內容不會被改寫，所以文字仍可選取與搜尋，頁面尺寸與旋轉也維持原樣。
 * 同一頁可以有多層 overlay，依陣列順序由下往上畫。
 * 原始檔是 PNG／JPEG 圖片時，輸出是一頁鋪滿該圖片的 PDF，頁面大小不超過同方向的 A4。
 * 有給 `password` 時以 AES-256 加密，使用者密碼與擁有者密碼相同。
 *
 * @param source 原始檔位元組（PDF、PNG 或 JPEG），不會被修改
 * @param overlays 各頁的簽名 overlay
 * @param options 匯出選項
 * @param options.sourcePassword 原始 PDF 受保護時，上傳時輸入的密碼
 * @param options.password 下載時設定的密碼，有值才加密
 * @throws 來源受保護而密碼缺漏或錯誤、來源格式無法辨識，或 overlay 的頁碼超出範圍時
 */
export async function createSignedPdf(
  source: Uint8Array,
  overlays: readonly PageOverlay[],
  { sourcePassword, password }: SignedPdfOptions = {},
): Promise<Uint8Array> {
  const pdf = await loadSource(source, sourcePassword);
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

function startsWith(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * 把原始檔載入成可以疊圖的文件。
 *
 * 圖片依檔頭辨識（不看副檔名或 MIME），包成單頁 PDF；其餘一律當成 PDF 載入，格式不對由 pdf-lib 丟錯。
 * 受保護的 PDF 解密後要清掉殘留的加密資訊，否則不加密的輸出仍會被 pdf-lib 當成加密檔。
 */
async function loadSource(source: Uint8Array, sourcePassword?: string): Promise<PDFDocument> {
  const isPng = startsWith(source, PNG_SIGNATURE);

  if (!isPng && !startsWith(source, JPEG_SIGNATURE)) {
    const pdf = await PDFDocument.load(source, { password: sourcePassword });

    dropStaleEncryption(pdf);

    return pdf;
  }

  const pdf = await PDFDocument.create();
  const image = await (isPng ? pdf.embedPng(source) : pdf.embedJpg(source));
  const { width, height } = toImagePageSize(image.width, image.height);

  pdf.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height });

  return pdf;
}

/**
 * 圖片原始檔的頁面尺寸（pt）：維持圖片長寬比，縮放到剛好放進同方向的 A4。
 * 橫向圖片對橫放的 A4、直向對直放的 A4，以 100% 列印時任何圖片都剛好在一張 A4 內。
 */
function toImagePageSize(imageWidth: number, imageHeight: number) {
  const isLandscape = imageWidth > imageHeight;
  const maxWidth = isLandscape ? A4_LONG_SIDE : A4_SHORT_SIDE;
  const maxHeight = isLandscape ? A4_SHORT_SIDE : A4_LONG_SIDE;
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);

  return { width: imageWidth * scale, height: imageHeight * scale };
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
