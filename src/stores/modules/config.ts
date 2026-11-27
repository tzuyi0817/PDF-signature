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
    toggleLoading({ isShow, title = '', content = '' }: PickPartial<Loading, 'title' | 'content'>) {
      this.loading = { isShow, title, content };
    },
    updateFilePassword(password: string) {
      this.filePassword = password;
    },
    setTheme(theme: Theme) {
      this.theme = theme;
    },
  },
});
