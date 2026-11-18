import { describe, expect, it } from 'vitest';
import { readJpegSource, withExifOrientation } from '../testing/source';
import { readJpegOrientation } from '.';

describe('readJpegOrientation', () => {
  it.each([1, 3, 6, 8])('讀出 EXIF 方向 %i', async orientation => {
    expect(readJpegOrientation(withExifOrientation(await readJpegSource(), orientation))).toBe(orientation);
  });

  it('little-endian 的 EXIF 也讀得出來', async () => {
    expect(readJpegOrientation(withExifOrientation(await readJpegSource(), 6, true))).toBe(6);
  });

  it('沒有 EXIF 方向或內容不完整時當成正向', () => {
    expect(readJpegOrientation(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]))).toBe(1);
    expect(readJpegOrientation(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff]))).toBe(1);
  });
});
