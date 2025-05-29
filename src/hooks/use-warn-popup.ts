import { ref } from 'vue';
import SignPopup from '@/components/SignPopup.vue';
import { useRedirect } from '@/hooks/use-redirect';

export function useWarnPopup() {
  const isShowWarnPopup = ref(false);
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
