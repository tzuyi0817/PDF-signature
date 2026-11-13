import { crc32, deflateSync } from 'node:zlib';

/** 建立 PNG chunk：長度 + 類型 + 資料 + CRC */
function createChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, checksum]);
}

/**
 * 產生一張透明底、畫有半透明藍色對角線的 RGBA PNG，用來模擬手寫簽名。
 * 不依賴 canvas，Node 內即可產生。
 */
export function createSignaturePng(width: number, height: number): Uint8Array {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);
  const strokeHalfWidth = Math.max(1, Math.round(height / 12));

  for (let y = 0; y < height; y++) {
    const center = Math.round((y / (height - 1)) * (width - 1));

    for (let x = 0; x < width; x++) {
      if (Math.abs(x - center) > strokeHalfWidth) continue;

      const offset = y * rowSize + 1 + x * 4;

      raw[offset] = 0x1f;
      raw[offset + 1] = 0x4e;
      raw[offset + 2] = 0xd8;
      raw[offset + 3] = 0xcc;
    }
  }

  const header = Buffer.alloc(13);

  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createChunk('IHDR', header),
    createChunk('IDAT', deflateSync(raw)),
    createChunk('IEND', new Uint8Array()),
  ]);
}
