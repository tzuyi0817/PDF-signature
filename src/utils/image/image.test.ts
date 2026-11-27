import { describe, expect, it } from 'vitest';
import { canvasToFile } from '.';

describe('canvasToFile', () => {
  it('canvas 無法輸出影像時 reject，而不是一直等待', async () => {
    const canvas = {
      toBlob: (callback: BlobCallback) => setTimeout(() => callback(null), 0),
    } as unknown as HTMLCanvasElement;

    await expect(canvasToFile(canvas)).rejects.toThrow('Failed to convert canvas to blob');
  });
});
