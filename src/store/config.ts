import { defineStore } from 'pinia';
import type { Loading } from '@/types/config';
import type { PickPartial } from '@/types/common';

interface ConfigStore {
  loading: Loading;
}

const defaultState: ConfigStore = {
  loading: {
    isShow: false,
    title: '',
    content: '',
  },
};

export default defineStore('pdf_signature_config', {
  state: () => ({ ...defaultState }),
  actions: {
    toggleLoading(loading: PickPartial<Loading, 'title' | 'content'>) {
      const { isShow, title = '', content = '' } = loading;

      this.loading = { isShow, title, content };
    },
  },
});
