import { defineStore } from 'pinia';
import type { PickPartial } from '@/types/common';
import type { Loading, Theme } from '@/types/config';

interface ConfigStore {
  loading: Loading;
  filePassword: string;
  theme: Theme;
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
  theme: 'light',
};

export const useConfigStore = defineStore('config', {
  state: () => ({ ...defaultState }),
  persist: {
    pick: ['theme'],
  },
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
    setTheme(theme: Theme) {
      this.theme = theme;
    },
  },
});
