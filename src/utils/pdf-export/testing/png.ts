import { crc32, deflateSync } from 'node:zlib';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** 8 位元深度、RGBA、無交錯 */
const HEADER_FORMAT = [8, 6, 0, 0, 0];

function createChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, checksum]);
}

/** 產生一張半透明藍色的 RGBA PNG，測試時當作簽名影像（Node 沒有 canvas） */
export function createPng(width: number, height: number): Uint8Array {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      raw.set([0x1f, 0x4e, 0xd8, 0xcc], y * rowSize + 1 + x * 4);
    }
  }

  const header = Buffer.alloc(13);

  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set(HEADER_FORMAT, 8);

  return new Uint8Array(
    Buffer.concat([
      Buffer.from(SIGNATURE),
      createChunk('IHDR', header),
      createChunk('IDAT', deflateSync(raw)),
      createChunk('IEND', new Uint8Array()),
    ]),
  );
}
