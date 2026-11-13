import { describe, expect, it } from 'vitest';
import { toPlacement } from './placement';

/** A4 直式、原點在 (0, 0) 的 CropBox */
const A4 = { x: 0, y: 0, width: 595.28, height: 841.89 };
/** 畫面上左上角 10%、20% 處，寬 30%、高 10% 的 overlay */
const OVERLAY = { x: 0.1, y: 0.2, width: 0.3, height: 0.1 };

describe('toPlacement', () => {
  it('未旋轉的頁面：把左上原點的比例座標換成左下原點的 pt', () => {
    const placement = toPlacement(OVERLAY, A4, 0);

    expect(placement.rotate).toBe(0);
    expect(placement.x).toBeCloseTo(59.528, 3);
    expect(placement.y).toBeCloseTo(841.89 * 0.7, 3);
    expect(placement.width).toBeCloseTo(178.584, 3);
    expect(placement.height).toBeCloseTo(84.189, 3);
  });

  it('旋轉 90 度的頁面：可視寬高對調，影像逆時針轉 90 度', () => {
    const placement = toPlacement(OVERLAY, A4, 90);

    expect(placement.rotate).toBe(90);
    expect(placement.width).toBeCloseTo(841.89 * 0.3, 3);
    expect(placement.height).toBeCloseTo(595.28 * 0.1, 3);
    expect(placement.x).toBeCloseTo(595.28 * 0.3, 3);
    expect(placement.y).toBeCloseTo(841.89 * 0.1, 3);
  });

  it('旋轉 180 度的頁面：錨點落在對角', () => {
    const placement = toPlacement(OVERLAY, A4, 180);

    expect(placement.rotate).toBe(180);
    expect(placement.x).toBeCloseTo(595.28 * 0.9, 3);
    expect(placement.y).toBeCloseTo(841.89 * 0.3, 3);
    expect(placement.width).toBeCloseTo(178.584, 3);
    expect(placement.height).toBeCloseTo(84.189, 3);
  });

  it('旋轉 270 度的頁面：可視寬高對調，影像逆時針轉 270 度', () => {
    const placement = toPlacement(OVERLAY, A4, 270);

    expect(placement.rotate).toBe(270);
    expect(placement.x).toBeCloseTo(595.28 * 0.7, 3);
    expect(placement.y).toBeCloseTo(841.89 * 0.9, 3);
    expect(placement.width).toBeCloseTo(841.89 * 0.3, 3);
    expect(placement.height).toBeCloseTo(595.28 * 0.1, 3);
  });

  it('CropBox 原點不在 (0, 0) 時，座標要加上 CropBox 的位移', () => {
    const placement = toPlacement(OVERLAY, { x: 50, y: 70, width: 400, height: 500 }, 0);

    expect(placement.x).toBeCloseTo(50 + 40, 3);
    expect(placement.y).toBeCloseTo(70 + 500 * 0.7, 3);
    expect(placement.width).toBeCloseTo(120, 3);
    expect(placement.height).toBeCloseTo(50, 3);
  });

  it('CropBox 位移與旋轉同時存在時，兩者都要套用', () => {
    const placement = toPlacement(OVERLAY, { x: 50, y: 70, width: 400, height: 500 }, 90);

    expect(placement.x).toBeCloseTo(50 + 400 * 0.3, 3);
    expect(placement.y).toBeCloseTo(70 + 500 * 0.1, 3);
  });

  it('橫向與非 A4 的頁面：依實際頁面尺寸換算', () => {
    const placement = toPlacement(OVERLAY, { x: 0, y: 0, width: 792, height: 612 }, 0);

    expect(placement.x).toBeCloseTo(79.2, 3);
    expect(placement.y).toBeCloseTo(612 * 0.7, 3);
    expect(placement.width).toBeCloseTo(237.6, 3);
    expect(placement.height).toBeCloseTo(61.2, 3);
  });

  it('旋轉角度為負數或超過 360 時，正規化到 0–359', () => {
    expect(toPlacement(OVERLAY, A4, -90)).toEqual(toPlacement(OVERLAY, A4, 270));
    expect(toPlacement(OVERLAY, A4, 450)).toEqual(toPlacement(OVERLAY, A4, 90));
  });

  it('旋轉角度不是 90 的倍數時丟出錯誤', () => {
    expect(() => toPlacement(OVERLAY, A4, 45)).toThrow('Unsupported page rotation: 45');
  });
});
