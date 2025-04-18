import { onBeforeUnmount, onMounted } from 'vue';
import { debounce } from '@/utils/common';

export function useResize(callback: () => void) {
  let previousWidth = 0;
  const debounceCallback = debounce(() => {
    if (previousWidth === window.innerWidth) return;
    previousWidth = window.innerWidth;
    callback();
  });

  onMounted(() => {
    window.addEventListener('resize', debounceCallback);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', debounceCallback);
  });
}
