import { ref } from 'vue';
import { Popup } from '@/components/common';
import { useRedirect } from '@/hooks/use-redirect';

export function useWarnPopup() {
  const isShowWarnPopup = ref(false);
  const { goBack, goPage } = useRedirect();

  function toggleWarnPopup(isOpen: boolean) {
    isShowWarnPopup.value = isOpen;
  }

  return {
    isShowWarnPopup,
    Popup,
    goBack,
    goPage,
    toggleWarnPopup,
  };
}
