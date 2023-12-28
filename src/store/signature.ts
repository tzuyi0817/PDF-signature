import { defineStore } from 'pinia';

interface SignatureStore {
  signatureList: string[];
}

const defaultState: SignatureStore = {
  signatureList: [],
};

export default defineStore('pdf_signature_signature', {
  state: () => ({ ...defaultState }),
  actions: {
    addSignature(signature: string) {
      this.signatureList.unshift(signature);
    },
    deleteSignature(signature: string) {
      this.signatureList = this.signatureList.filter(sign => sign !== signature);
    },
  },
  persist: {
    storage: localStorage,
    paths: ['signatureList'],
  },
});
