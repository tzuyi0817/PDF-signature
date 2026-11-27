import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import { IDB_KEY } from '@/constants/idb';
import { getIdb, setIdb } from '@/utils/idb';
import { useFolderStore } from '../folder';
import type { MenuTab } from '@/types/menu';
import type { PDF, SignResult } from '@/types/pdf';

export interface PDFStore {
  currentPDF: PDF;
  PDFList: PDF[];
  archiveList: PDF[];
  trashList: PDF[];
}

const defaultState: PDFStore = {
  currentPDF: {
    PDFId: '',
    name: '',
    updateDate: 0,
    data: null,
    pages: 0,
    canvas: [],
    trashDate: 0,
    isUpdate: false,
    width: 0,
    height: 0,
  },
  PDFList: [],
  archiveList: [],
  trashList: [],
};

export const usePdfStore = defineStore('pdf', {
  state: (): PDFStore => ({ ...defaultState, PDFList: [], archiveList: [], trashList: [] }),
  getters: {},
  actions: {
    async getCurrentPDF() {
      const currentPDF = await getIdb<PDF>(IDB_KEY.CURRENT_PDF);

      if (!currentPDF) return;

      this.currentPDF = currentPDF;

      return currentPDF;
    },
    async setCurrentPDF(PDF: PDF) {
      const { currentFolderId } = useFolderStore();
      const next = { ...PDF, folderId: currentFolderId ?? undefined };

      await setIdb(IDB_KEY.CURRENT_PDF, next);
      this.currentPDF = next;
    },
    async clearCurrentPDF() {
      const empty: PDF = {
        PDFId: '',
        name: '',
        updateDate: 0,
        data: null,
        pages: 0,
        canvas: [],
        trashDate: 0,
        isUpdate: false,
        width: 0,
        height: 0,
        folderId: undefined,
      };

      await setIdb(IDB_KEY.CURRENT_PDF, empty);
      this.currentPDF = empty;
    },
    async setCurrentPDFName(name: string) {
      const next = { ...this.currentPDF, name };

      await setIdb(IDB_KEY.CURRENT_PDF, next);
      this.currentPDF = next;
    },
    /** 寫入一次簽署的結果：新的 overlay 排在既有的之後（既有的不動），並更新第一頁縮圖；原始檔保留 */
    async setCurrentPDFSignResult({ overlays, thumbnail }: SignResult) {
      const signed = {
        ...this.currentPDF,
        overlays: [...(this.currentPDF.overlays ?? []), ...overlays],
        thumbnail,
      };

      await setIdb(IDB_KEY.CURRENT_PDF, signed);
      this.currentPDF = signed;
    },
    async restoreCurrentPDF(PDF: PDF) {
      await setIdb(IDB_KEY.CURRENT_PDF, PDF);
      this.currentPDF = PDF;
    },

    async getPDF() {
      const PDFList = await getIdb<PDF[]>(IDB_KEY.PDF_LIST);

      if (!PDFList) return;

      this.PDFList = PDFList;

      return PDFList;
    },
    addPDF(PDF: PDF) {
      return this.addPDFs([PDF]);
    },
    async addPDFs(PDFs: PDF[]) {
      const items = PDFs.map(PDF => this.sanitizeFolderId({ ...PDF }));

      this.PDFList = items.toReversed().concat(this.PDFList);

      try {
        await this.updatePDFIdb();
      } catch (error) {
        this.PDFList = this.PDFList.filter(entry => !items.includes(toRaw(entry)));
        throw error;
      }
    },
    async updatePDF(PDF: PDF) {
      const previous = this.PDFList.find(item => item.PDFId === PDF.PDFId);

      if (!previous) {
        await this.addPDF({ ...PDF, PDFId: crypto.randomUUID() });

        return;
      }

      this.PDFList = this.PDFList.map(item => (item === previous ? PDF : item));

      try {
        await this.updatePDFIdb();
      } catch (error) {
        this.PDFList = this.PDFList.map(item => (toRaw(item) === toRaw(PDF) ? previous : item));

        throw error;
      }
    },
    deletePDF(id: string) {
      this.PDFList = this.PDFList.filter(({ PDFId }) => id !== PDFId);

      return this.updatePDFIdb();
    },
    updatePDFIdb() {
      return setIdb(IDB_KEY.PDF_LIST, this.PDFList);
    },

    async getArchive() {
      const archiveList = await getIdb<PDF[]>(IDB_KEY.ARCHIVE_LIST);

      if (!archiveList) return;

      this.archiveList = archiveList;

      return archiveList;
    },
    addArchive(PDF: PDF) {
      this.deletePDF(PDF.PDFId);
      this.archiveList.unshift(PDF);

      return this.updateArchiveIdb();
    },
    batchAddArchive(PDFList: Set<PDF>) {
      for (const PDF of PDFList) {
        this.PDFList = this.PDFList.filter(({ PDFId }) => PDF.PDFId !== PDFId);
        this.archiveList.unshift(PDF);
      }

      return Promise.all([this.updatePDFIdb(), this.updateArchiveIdb()]);
    },
    deleteArchive(id: string) {
      this.archiveList = this.archiveList.filter(({ PDFId }) => id !== PDFId);

      return this.updateArchiveIdb();
    },
    async batchReductionArchive(PDFList: Set<PDF>) {
      const restoring = [...PDFList].filter(({ PDFId }) => this.PDFList.every(item => item.PDFId !== PDFId));
      const ids = new Set(restoring.map(({ PDFId }) => PDFId));

      if (restoring.length === 0) return;

      await this.addPDFs(restoring);
      this.archiveList = this.archiveList.filter(({ PDFId }) => !ids.has(PDFId));
      await this.updateArchiveIdb();
    },
    updateArchiveIdb() {
      return setIdb(IDB_KEY.ARCHIVE_LIST, this.archiveList);
    },

    async getTrash() {
      const trashList = await getIdb<PDF[]>(IDB_KEY.TRASH_LIST);

      if (!trashList) return;

      this.trashList = trashList;

      return trashList;
    },
    addTrash(PDF: PDF, type?: MenuTab) {
      if (!type || type === 'file') this.deletePDF(PDF.PDFId);
      if (!type || type === 'archive') this.deleteArchive(PDF.PDFId);

      this.trashList.unshift({ ...PDF, trashDate: Date.now() });

      return this.updateTrashIdb();
    },
    batchAddTrash(PDFList: Set<PDF>, type: MenuTab) {
      for (const PDF of PDFList) {
        if (type === 'file') {
          this.PDFList = this.PDFList.filter(({ PDFId }) => PDF.PDFId !== PDFId);
        }
        if (type === 'archive') {
          this.archiveList = this.archiveList.filter(({ PDFId }) => PDF.PDFId !== PDFId);
        }
        this.trashList.unshift({ ...PDF, trashDate: Date.now() });
      }
      return Promise.all([this.updatePDFIdb(), this.updateArchiveIdb(), this.updateTrashIdb()]);
    },
    deleteTrash(id?: string) {
      if (!id) return;

      this.trashList = this.trashList.filter(({ PDFId }) => id !== PDFId);

      return this.updateTrashIdb();
    },
    batchDeleteTrash(PDFList: Set<PDF>) {
      for (const PDF of PDFList) {
        this.trashList = this.trashList.filter(({ PDFId }) => PDF.PDFId !== PDFId);
      }

      return this.updateTrashIdb();
    },
    async batchReductionTrash(PDFList: Set<PDF>) {
      const restoring = [...PDFList].filter(({ PDFId }) => this.PDFList.every(item => item.PDFId !== PDFId));
      const ids = new Set(restoring.map(({ PDFId }) => PDFId));

      if (restoring.length === 0) return;

      await this.addPDFs(restoring);
      this.trashList = this.trashList.filter(({ PDFId }) => !ids.has(PDFId));
      await this.updateTrashIdb();
    },
    filterTrash() {
      const MAX_DAY = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      this.trashList = this.trashList.filter(({ trashDate }) => {
        if (!trashDate) return true;
        return now - trashDate < MAX_DAY;
      });

      return this.updateTrashIdb();
    },
    updateTrashIdb() {
      return setIdb(IDB_KEY.TRASH_LIST, this.trashList);
    },

    /** 檔案原資料夾已不存在時，還原至根目錄 */
    sanitizeFolderId(pdf: PDF): PDF {
      const folderStore = useFolderStore();

      if (pdf.folderId && !folderStore.getFolderById(pdf.folderId)) {
        return { ...pdf, folderId: undefined };
      }

      return pdf;
    },
    /** 將檔案移動到指定資料夾 */
    moveFilesToFolder(pdfIds: Set<string>, folderId: string | null) {
      const targetFolderId = folderId ?? undefined;

      for (const pdf of this.PDFList) {
        if (pdfIds.has(pdf.PDFId)) {
          pdf.folderId = targetFolderId;
        }
      }

      return this.updatePDFIdb();
    },
    /** 刪除資料夾時，將其下所有檔案移入垃圾桶，並清除封存與垃圾桶內指向已刪資料夾的 folderId */
    trashFilesByFolderIds(folderIds: Set<string>) {
      const isInDeletedFolder = (pdf: PDF) => Boolean(pdf.folderId && folderIds.has(pdf.folderId));
      const clearFolderId = (pdf: PDF) => (isInDeletedFolder(pdf) ? { ...pdf, folderId: undefined } : pdf);
      const trashChanged = this.trashList.some(pdf => isInDeletedFolder(pdf));
      const archiveChanged = this.archiveList.some(pdf => isInDeletedFolder(pdf));

      if (trashChanged) this.trashList = this.trashList.map(pdf => clearFolderId(pdf));
      if (archiveChanged) this.archiveList = this.archiveList.map(pdf => clearFolderId(pdf));

      const trashedFiles = this.PDFList.filter(pdf => isInDeletedFolder(pdf)).map(pdf => ({
        ...pdf,
        folderId: undefined,
      }));

      // batchAddTrash 會一併寫入三份清單的 IDB，涵蓋上方的 folderId 清理
      if (trashedFiles.length > 0) return this.batchAddTrash(new Set(trashedFiles), 'file');

      const updates: Promise<unknown>[] = [];

      if (trashChanged) updates.push(this.updateTrashIdb());
      if (archiveChanged) updates.push(this.updateArchiveIdb());

      return Promise.all(updates);
    },
  },
});
