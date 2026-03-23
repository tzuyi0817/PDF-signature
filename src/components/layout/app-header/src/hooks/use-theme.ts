import { storeToRefs } from 'pinia';
import { onScopeDispose, watch } from 'vue';
import { useConfigStore } from '@/stores';
import type { Theme } from '@/types/config';

const THEME_ORDER: Theme[] = ['light', 'dark', 'system'];

export function useTheme() {
  const configStore = useConfigStore();
  const { theme } = storeToRefs(configStore);
  const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(value: Theme) {
    const isDark = value === 'dark' || (value === 'system' && mediaQuery.matches);

    document.documentElement.classList.toggle('dark', isDark);
  }

  function toggleTheme() {
    const currentIndex = THEME_ORDER.indexOf(theme.value);
    const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];

    configStore.setTheme(nextTheme);
  }

  function onSystemChange() {
    if (theme.value === 'system') {
      applyTheme('system');
    }
  }

  mediaQuery.addEventListener('change', onSystemChange);

  const stopWatch = watch(theme, applyTheme, { immediate: true });

  onScopeDispose(() => {
    mediaQuery.removeEventListener('change', onSystemChange);
    stopWatch();
  });

  return { theme, toggleTheme };
}
