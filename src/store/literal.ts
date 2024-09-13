import { defineStore } from 'pinia';

interface ImageStore {
  literalList: string[];
}

const defaultState: ImageStore = {
  literalList: [],
};

export const useLiteralStore = defineStore('pdf_signature_literal', {
  state: () => ({ ...defaultState }),
  actions: {
    addLiteral(text: string) {
      this.literalList.unshift(text);
    },
    deleteLiteral(text: string) {
      this.literalList = this.literalList.filter(literal => literal !== text);
    },
  },
  persist: {
    storage: localStorage,
    pick: ['literalList'],
  },
});
