const APP1_MARKER = 0xe1;
const START_OF_SCAN_MARKER = 0xda;
/** ASCII 的 "Exif" */
const EXIF_HEADER = 0x45_78_69_66;
/** TIFF 位元組順序標記 "II"（little-endian） */
const LITTLE_ENDIAN = 0x49_49;
const ORIENTATION_TAG = 0x01_12;
const UPRIGHT = 1;

/**
 * 讀出 JPEG 的 EXIF 方向（1–8）；沒有 EXIF 或內容不完整時當成正向（1）。
 *
 * 瀏覽器顯示圖片時會依這個值旋轉，但 pdf-lib 嵌入 JPEG 時不會，
 * 所以方向不是 1 的照片不能直接嵌入，否則匯出的方向會與簽名時看到的不同。
 */
export function readJpegOrientation(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  try {
    let offset = 2;

    while (view.getUint8(offset) === 0xff) {
      const marker = view.getUint8(offset + 1);

      if (marker === START_OF_SCAN_MARKER) break;

      if (marker === APP1_MARKER && view.getUint32(offset + 4) === EXIF_HEADER) {
        return readTiffOrientation(view, offset + 10);
      }

      offset += 2 + view.getUint16(offset + 2);
    }
  } catch {
    // 讀到檔案結尾之外：內容不完整，當成沒有方向資訊
  }

  return UPRIGHT;
}

function readTiffOrientation(view: DataView, tiffOffset: number): number {
  const isLittleEndian = view.getUint16(tiffOffset) === LITTLE_ENDIAN;
  const directory = tiffOffset + view.getUint32(tiffOffset + 4, isLittleEndian);
  const entries = view.getUint16(directory, isLittleEndian);

  for (let index = 0; index < entries; index++) {
    const entry = directory + 2 + index * 12;

    if (view.getUint16(entry, isLittleEndian) === ORIENTATION_TAG) {
      return view.getUint16(entry + 8, isLittleEndian);
    }
  }

  return UPRIGHT;
}
