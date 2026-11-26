import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDB_KEY } from '@/constants/idb';
import { hasOriginalPDF } from '@/utils/pdf-document';
import { usePdfStore } from '.';
import type { PDF, StoredOverlay } from '@/types/pdf';

const idb = vi.hoisted(() => new Map<unknown, unknown>());
const setIdbValue = vi.hoisted(() =>
  vi.fn((key: unknown, value: unknown) => Promise.resolve(void idb.set(key, value))),
);

vi.mock('idb-keyval', () => ({
  get: (key: unknown) => Promise.resolve(idb.get(key)),
  set: setIdbValue,
  del: (key: unknown) => Promise.resolve(void idb.delete(key)),
}));

const DAY = 24 * 60 * 60 * 1000;

function createOriginal() {
  return new File(['%PDF-1.7 original'], 'contract.pdf', { type: 'application/pdf' });
}

function createOverlay(page: number): StoredOverlay {
  return { page, x: 0.1, y: 0.2, width: 0.3, height: 0.1, image: new Blob([`overlay-${page}`], { type: 'image/png' }) };
}

function createDocument(overrides: Partial<PDF> = {}): PDF {
  return { PDFId: 'doc-1', name: 'contract', updateDate: 1, pages: 3, data: createOriginal(), ...overrides };
}

function createLegacyDocument(): PDF {
  return {
    PDFId: 'legacy-1',
    name: 'legacy',
    updateDate: 1,
    pages: 2,
    data: null,
    canvas: [new Blob(['page-1'], { type: 'image/png' }), new Blob(['page-2'], { type: 'image/png' })],
    width: 595,
    height: 842,
    isUpdate: false,
    trashDate: 0,
  };
}

describe('pdf store：原始 PDF 與簽名 overlay', () => {
  beforeEach(() => {
    idb.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('寫入簽署結果', () => {
    it('存下 overlay 與第一頁縮圖，原始 PDF 保留，不再產生整頁 PNG', async () => {
      const store = usePdfStore();
      const original = createOriginal();
      const thumbnail = new Blob(['thumbnail'], { type: 'image/png' });
      const overlays = [createOverlay(1), createOverlay(3)];

      await store.setCurrentPDF(createDocument({ data: original }));
      await store.setCurrentPDFSignResult({ overlays, thumbnail });

      const saved = idb.get(IDB_KEY.CURRENT_PDF) as PDF;

      expect(saved.data).toBe(original);
      expect(saved.overlays).toEqual(overlays);
      expect(saved.thumbnail).toBe(thumbnail);
      expect(saved.canvas).toBeUndefined();
    });

    it('沒有簽名的頁不會有 overlay', async () => {
      const store = usePdfStore();

      await store.setCurrentPDF(createDocument());
      await store.setCurrentPDFSignResult({ overlays: [createOverlay(2)], thumbnail: new Blob(['thumbnail']) });

      expect(store.currentPDF.overlays?.map(({ page }) => page)).toEqual([2]);
    });

    it('再次簽署時，既有 overlay 不動，新的排在後面成為額外一層', async () => {
      const store = usePdfStore();
      const first = createOverlay(1);
      const second = createOverlay(1);
      const newThumbnail = new Blob(['new-thumbnail']);

      await store.setCurrentPDF(createDocument({ overlays: [first], thumbnail: new Blob(['old-thumbnail']) }));
      await store.setCurrentPDFSignResult({ overlays: [second], thumbnail: newThumbnail });

      const saved = idb.get(IDB_KEY.CURRENT_PDF) as PDF;

      expect(saved.overlays).toHaveLength(2);
      expect(saved.overlays?.[0]?.image).toBe(first.image);
      expect(saved.overlays?.[1]?.image).toBe(second.image);
      expect(saved.thumbnail).toBe(newThumbnail);
    });

    it('寫入失敗後重試，同一批 overlay 只會存一份', async () => {
      const store = usePdfStore();
      const result = { overlays: [createOverlay(1)], thumbnail: new Blob(['thumbnail']) };

      await store.setCurrentPDF(createDocument());
      setIdbValue.mockRejectedValueOnce(new Error('QuotaExceededError'));

      await expect(store.setCurrentPDFSignResult(result)).rejects.toThrow('QuotaExceededError');
      await store.setCurrentPDFSignResult(result);

      expect(store.currentPDF.overlays).toHaveLength(1);
      expect((idb.get(IDB_KEY.CURRENT_PDF) as PDF).overlays).toHaveLength(1);
    });

    it('寫入失敗時 IndexedDB 仍保留原本的目前文件', async () => {
      const store = usePdfStore();
      const result = { overlays: [createOverlay(1)], thumbnail: new Blob(['thumbnail']) };

      await store.setCurrentPDF(createDocument());
      setIdbValue.mockRejectedValueOnce(new Error('QuotaExceededError'));

      await expect(store.setCurrentPDFSignResult(result)).rejects.toThrow('QuotaExceededError');

      expect((idb.get(IDB_KEY.CURRENT_PDF) as PDF | undefined)?.PDFId).toBe('doc-1');
    });
  });

  describe('原始 PDF 的生命週期', () => {
    it('從列表移到封存再移到垃圾桶，原始 PDF 與 overlay 都還在', async () => {
      const store = usePdfStore();
      const original = createOriginal();
      const document = createDocument({ data: original, overlays: [createOverlay(1)] });

      await store.addPDF(document);
      expect((idb.get(IDB_KEY.PDF_LIST) as PDF[])[0]?.data).toBe(original);

      await store.addArchive(store.PDFList[0]!);
      expect((idb.get(IDB_KEY.ARCHIVE_LIST) as PDF[])[0]?.data).toBe(original);

      await store.addTrash(store.archiveList[0]!, 'archive');

      const [trashed] = idb.get(IDB_KEY.TRASH_LIST) as PDF[];

      expect(trashed?.data).toBe(original);
      expect(trashed?.overlays).toHaveLength(1);
    });

    it('垃圾桶滿 30 天清除時，原始 PDF 隨文件一併從 IDB 刪除', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-16T00:00:00Z'));

      const store = usePdfStore();

      await store.addTrash(createDocument());
      vi.setSystemTime(Date.now() + 30 * DAY);
      await store.filterTrash();

      expect(store.trashList).toEqual([]);
      expect(idb.get(IDB_KEY.TRASH_LIST)).toEqual([]);
    });

    it('垃圾桶未滿 30 天時，原始 PDF 保留', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-16T00:00:00Z'));

      const store = usePdfStore();
      const original = createOriginal();

      await store.addTrash(createDocument({ data: original }));
      vi.setSystemTime(Date.now() + 30 * DAY - 1);
      await store.filterTrash();

      expect((idb.get(IDB_KEY.TRASH_LIST) as PDF[])[0]?.data).toBe(original);
    });
  });

  describe('此變更前儲存的文件', () => {
    it('只有 PNG 頁、沒有原始 PDF 的文件照原樣載入', async () => {
      const legacy = createLegacyDocument();

      idb.set(IDB_KEY.PDF_LIST, [legacy]);
      idb.set(IDB_KEY.CURRENT_PDF, legacy);

      const store = usePdfStore();

      await Promise.all([store.getPDF(), store.getCurrentPDF()]);

      expect(store.PDFList).toEqual([legacy]);
      expect(store.currentPDF).toEqual(legacy);
      expect(store.PDFList[0]?.canvas).toHaveLength(2);
    });

    it('以有沒有原始 PDF 區分新舊文件', () => {
      expect(hasOriginalPDF(createLegacyDocument())).toBe(false);
      expect(hasOriginalPDF(createDocument())).toBe(true);
    });
  });
});
