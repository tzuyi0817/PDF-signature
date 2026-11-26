import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  MOCK_FILES,
  MOCK_IMAGE_SOURCE_WIDTH,
  MOCK_OVERLAY_BOX,
  MOCK_PAGE_IMAGE_WIDTH,
  MOCK_THUMBNAIL_WIDTH,
  setMockCurrentPDF,
  STORED_BLOB,
  type MockCurrentKind,
} from '../mocks/file';

const SIGNED_PAGES = 7;

async function openCompletePage(page: Page, kind: MockCurrentKind) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await setMockCurrentPDF(page, kind);
  await page.goto('/complete', { waitUntil: 'domcontentloaded' });
}

/** canvas 是否已畫上內容：有像素尺寸，且左上角不是透明的 */
function isPainted(canvas: Locator) {
  return canvas.evaluate((element: HTMLCanvasElement) => {
    if (element.width === 0) return false;

    return (element.getContext('2d')?.getImageData(0, 0, 1, 1).data[3] ?? 0) > 0;
  });
}

/** overlay 相對於所在頁面的位置（0–1 比例） */
async function measureOverlay(overlay: Locator, container: Locator) {
  const [box, frame] = await Promise.all([overlay.boundingBox(), container.boundingBox()]);

  if (!box || !frame) throw new Error('Overlay or its page is not rendered');

  return {
    x: (box.x - frame.x) / frame.width,
    y: (box.y - frame.y) / frame.height,
    width: box.width / frame.width,
    height: box.height / frame.height,
  };
}

function expectOverlayInPlace(measured: typeof MOCK_OVERLAY_BOX) {
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(measured[key]).toBeCloseTo(MOCK_OVERLAY_BOX[key], 2);
  }
}

test.describe('complete page preview', { tag: [STORED_BLOB] }, () => {
  test.describe('document that keeps its original PDF', () => {
    test.beforeEach(async ({ page }) => {
      await openCompletePage(page, 'signed');
    });

    test('renders every page from the original with the overlay on top', async ({ page }) => {
      const pages = page.getByRole('img', { name: 'PDF document', exact: true });

      await expect(pages).toHaveCount(SIGNED_PAGES);
      await expect.poll(() => isPainted(pages.first())).toBe(true);

      const overlay = page.getByRole('img', { name: 'signature', exact: true });

      await expect(overlay).toHaveJSProperty('complete', true);
      expectOverlayInPlace(await measureOverlay(overlay, pages.first()));
    });

    test('renders pages only when they come near the viewport and releases them afterwards', async ({ page }) => {
      const pages = page.getByRole('img', { name: 'PDF document', exact: true });
      const first = pages.first();
      const last = pages.last();

      await expect.poll(() => isPainted(first)).toBe(true);
      await expect(last).toHaveJSProperty('width', 0);

      await last.scrollIntoViewIfNeeded();

      await expect.poll(() => isPainted(last)).toBe(true);
      await expect(first).toHaveJSProperty('width', 0);
    });

    test('terminates its pdf.js worker after leaving the page', async ({ page }) => {
      const pages = page.getByRole('img', { name: 'PDF document', exact: true });

      await expect.poll(() => isPainted(pages.first())).toBe(true);

      const openWorkers = page.workers().length;

      await page.getByRole('button', { name: /return to home page/i }).click();
      await page.waitForURL('http://localhost:8081/');

      await expect.poll(() => page.workers().length).toBe(openWorkers - 1);
    });
  });

  test('document saved before the storage change renders its stored pages', async ({ page }) => {
    await openCompletePage(page, 'legacy');

    const pages = page.getByRole('img', { name: 'PDF document', exact: true });

    await expect(pages).toHaveCount(MOCK_FILES[0].pages);
    await expect(pages.first()).toHaveJSProperty('naturalWidth', MOCK_PAGE_IMAGE_WIDTH);
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('image original renders the image with the overlay on top', async ({ page }) => {
    await openCompletePage(page, 'image');

    const image = page.getByRole('img', { name: 'PDF document', exact: true });
    const overlay = page.getByRole('img', { name: 'signature', exact: true });

    await expect(image).toHaveJSProperty('naturalWidth', MOCK_IMAGE_SOURCE_WIDTH);
    await expect(overlay).toHaveJSProperty('complete', true);
    expectOverlayInPlace(await measureOverlay(overlay, image));
  });

  test('falls back to the stored thumbnail when the original cannot be rendered', async ({ page }) => {
    await openCompletePage(page, 'broken');

    await expect(page.getByRole('img', { name: 'PDF document', exact: true })).toHaveJSProperty(
      'naturalWidth',
      MOCK_THUMBNAIL_WIDTH,
    );
  });
});
