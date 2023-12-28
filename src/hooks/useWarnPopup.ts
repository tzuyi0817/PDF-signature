import { ref, defineAsyncComponent } from 'vue';
import useRedirect from '@/hooks/useRedirect';

export default function useWarnPopup() {
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
