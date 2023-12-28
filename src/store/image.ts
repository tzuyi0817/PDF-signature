import { defineStore } from 'pinia';

interface ImageStore {
  imageList: string[];
}

const defaultState: ImageStore = {
  imageList: [],
};

export default defineStore('pdf_signature_image', {
  state: () => ({ ...defaultState }),
  actions: {
    addImage(image: string) {
      this.imageList.unshift(image);
    },
    deleteImage(image: string) {
      this.imageList = this.imageList.filter(img => img !== image);
    },
  },
  persist: {
    storage: localStorage,
    paths: ['imageList'],
  },
});
