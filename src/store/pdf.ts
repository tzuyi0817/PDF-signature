import { defineStore } from 'pinia';
import { getIdb, setIdb } from '@/utils/idb';
import { IDB_KEY } from '@/configs/idb.config';
import type { PDF } from '@/types/pdf';

interface PDFStore {
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
    PDFBase64: '',
    pages: 0,
    canvas: [],
    trashDate: 0,
  },
  PDFList: [],
  archiveList: [],
  trashList: [],
};

export default defineStore('pdf_signature_pdf', {
  state: () => ({ ...defaultState }),
  getters: {},
  actions: {
    async getCurrentPDF() {
      const currentPDF = await getIdb<PDF>(IDB_KEY.CURRENT_PDF);

      if (!currentPDF) return;
      this.currentPDF = currentPDF;
    },
    setCurrentPDF(PDF: PDF) {
      this.currentPDF = PDF;
      return this.updateCurrentPDFIdb();
    },
    clearCurrentPDF() {
      this.currentPDF = {
        PDFId: '',
        name: '',
        updateDate: 0,
        PDFBase64: '',
        pages: 0,
        canvas: [],
      };
      return this.updateCurrentPDFIdb();
    },
    setCurrentPDFName(name: string) {
      this.currentPDF.name = name;
      return this.updateCurrentPDFIdb();
    },
    setCurrentPDFCanvas(canvas: string[]) {
      this.currentPDF.canvas = canvas;
      return this.updateCurrentPDFIdb();
    },
    updateCurrentPDFIdb() {
      return setIdb(IDB_KEY.CURRENT_PDF, this.currentPDF);
    },

    async getPDF() {
      const PDFList = await getIdb<PDF[]>(IDB_KEY.PDF_LIST);

      if (!PDFList) return;
      this.PDFList = PDFList;
    },
    addPDF(PDF: PDF) {
      this.PDFList.unshift({ ...PDF });
      return this.updatePDFIdb();
    },
    updatePDF(id: string, PDF: PDF) {
      const index = this.PDFList.findIndex(item => item.PDFId === id);
      if (index === -1) return;
      this.PDFList[index] = PDF;
      return this.updatePDFIdb();
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
    },
    addArchive(PDF: PDF) {
      this.deletePDF(PDF.PDFId);
      this.archiveList.unshift(PDF);
      return this.updateArchiveIdb();
    },
    deleteArchive(id: string) {
      this.archiveList = this.archiveList.filter(({ PDFId }) => id !== PDFId);
      return this.updateArchiveIdb();
    },
    updateArchiveIdb() {
      return setIdb(IDB_KEY.ARCHIVE_LIST, this.archiveList);
    },

    async getTrash() {
      const trashList = await getIdb<PDF[]>(IDB_KEY.TRASH_LIST);

      if (!trashList) return;
      this.trashList = trashList;
    },
    addTrash(PDF: PDF) {
      this.deletePDF(PDF.PDFId);
      this.deleteArchive(PDF.PDFId);
      this.trashList.unshift({ ...PDF, trashDate: Date.now() });
      return this.updateTrashIdb();
    },
    deleteTrash(id: string) {
      this.trashList = this.trashList.filter(({ PDFId }) => id !== PDFId);
      return this.updateTrashIdb();
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
  },
});
