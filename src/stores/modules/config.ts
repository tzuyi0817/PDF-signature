import { defineStore } from 'pinia';
import type { PickPartial } from '@/types/common';
import type { Loading } from '@/types/config';

interface ConfigStore {
  loading: Loading;
  filePassword: string;
}

const defaultState: ConfigStore = {
  loading: {
    isShow: false,
    title: '',
    content: '',
    isProcess: false,
    completeness: 0,
  },
  filePassword: '',
};

export const useConfigStore = defineStore('config', {
  state: () => ({ ...defaultState }),
  actions: {
    toggleLoading({
      isShow,
      title = '',
      content = '',
      isProcess = false,
      completeness = 0,
    }: PickPartial<Loading, 'title' | 'content' | 'isProcess' | 'completeness'>) {
      this.loading = { isShow, title, content, isProcess, completeness };
    },
    setLoadingCompleteness(completeness: number) {
      this.loading.completeness = completeness;
    },
    updateFilePassword(password: string) {
      this.filePassword = password;
    },
  },
});
