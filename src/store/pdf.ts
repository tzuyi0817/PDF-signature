import { defineStore } from 'pinia';
import type { PDF } from '@/types/pdf';

interface PDFStore {
  currentPDF: PDF;
  PDFList: PDF[];
}

const defaultState: PDFStore = {
  currentPDF: {
    PDFId: '',
    name: '',
    updateDate: 0,
    PDFBase64: '',
    pages: 0,
  },
  PDFList: [],
  // archiveList: [],
};

export default defineStore('pdf_signature_pdf', {
  state: () => ({ ...defaultState }),
  getters: {

  },
  actions: {
    setCurrentPDF(PDF: PDF) {
      this.currentPDF = PDF;
    },
    setCurrentPDFName(name: string) {
      this.currentPDF.name = name;
    },
    getPDF(id: string) {
      return this.PDFList.find(item => item.PDFId === id);
    },
    addPDF(PDF: PDF) {
      this.PDFList.unshift(PDF);
    },
    updatePDF(id: string, PDF: PDF) {
      const index = this.PDFList.findIndex(item => item.PDFId === id);
      if (index === -1) return;
      this.PDFList[index] = PDF;
    },
    removePDF(id: string) {
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
      'currentPDF',
    ],
  },
});