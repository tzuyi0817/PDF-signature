import { defineStore } from 'pinia';
import type { PDF } from '@/types/pdf';

interface PdfStore {
  PDFList: PDF[];
}

const defaultState: PdfStore = {
  PDFList: [],
  // archiveList: [],
};

export default defineStore('pdf_signature_pdf', {
  state: () => ({ ...defaultState }),
  getters: {

  },
  actions: {
    getPDF(id: string) {
      return this.PDFList.find(item => item.PDFId === id);
    },
    addPDF(PDF: PDF) {
      this.PDFList.push(PDF);
    },
    updatePDF(id: string, name: string) {
      const PDF = this.getPDF(id);
      if (!PDF) return;
      PDF.name = name;
    },
    removePDF(id: string) {
      if (!id) return;
      this.PDFList = this.PDFList.filter(({ PDFId }) => id !== PDFId);
    }
    // setArchiveList(list) {
    //   this.archiveList = list;
    // }
  },
  persist: {
    storage: localStorage,
    paths: [
      'PDFList',
    ],
  },
});