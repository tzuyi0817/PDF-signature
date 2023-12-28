import { defineStore } from 'pinia';
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
    setCurrentPDF(PDF: PDF) {
      this.currentPDF = PDF;
    },
    setCurrentPDFName(name: string) {
      this.currentPDF.name = name;
    },
    setCurrentPDFCanvas(canvas: string[]) {
      this.currentPDF.canvas = canvas;
    },
    addPDF(PDF: PDF) {
      this.PDFList.unshift({ ...PDF });
    },
    updatePDF(id: string, PDF: PDF) {
      const index = this.PDFList.findIndex(item => item.PDFId === id);
      if (index === -1) return;
      this.PDFList[index] = PDF;
    },
    deletePDF(id: string) {
      this.PDFList = this.PDFList.filter(({ PDFId }) => id !== PDFId);
    },
    addArchive(PDF: PDF) {
      this.deletePDF(PDF.PDFId);
      this.archiveList.unshift(PDF);
    },
    deleteArchive(id: string) {
      this.archiveList = this.archiveList.filter(({ PDFId }) => id !== PDFId);
    },
    addTrash(PDF: PDF) {
      this.deletePDF(PDF.PDFId);
      this.deleteArchive(PDF.PDFId);
      this.trashList.unshift({ ...PDF, trashDate: Date.now() });
    },
    deleteTrash(id: string) {
      this.trashList = this.trashList.filter(({ PDFId }) => id !== PDFId);
    },
    filterTrash() {
      const MAX_DAY = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      this.trashList = this.trashList.filter(({ trashDate }) => {
        return now - trashDate! < MAX_DAY;
      });
    },
  },
  persist: {
    storage: localStorage,
    paths: ['currentPDF', 'PDFList', 'archiveList', 'trashList'],
  },
});
