import { defineAsyncComponent, ref } from 'vue';
import { useRedirect } from '@/hooks/use-redirect';

export function useWarnPopup() {
  const isShowWarnPopup = ref(false);
  const SignPopup = defineAsyncComponent(() => import('@/components/SignPopup.vue'));
  const { goBack, goPage } = useRedirect();

  function toggleWarnPopup(isOpen: boolean) {
    isShowWarnPopup.value = isOpen;
  }

  return {
    isShowWarnPopup,
    SignPopup,
    goBack,
    goPage,
    toggleWarnPopup,
  };
}
