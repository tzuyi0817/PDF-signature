import { ref, readonly, computed, watchEffect, type Ref } from 'vue';
import { sleep } from '@/utils/common';
import type { PDF } from '@/types/pdf';

export function useLoadCanvas(currentPDF: Ref<PDF>) {
  const loadedState = ref<boolean[]>([]);
  const loadedPages = ref(-1);

  const isCompleted = computed(() => loadedPages.value === currentPDF.value.pages);

  async function handleCanvasLoaded(page: number) {
    await sleep(100);
    loadedState.value[page] = true;
    loadedPages.value += 1;
  }

  watchEffect(() => {
    if (!currentPDF.value?.pages) return;

    loadedPages.value = 0;
    loadedState.value = Array.from({ length: currentPDF.value.pages + 1 }, () => false);
    loadedState.value[0] = true;
  });

  return {
    loadedState: readonly(loadedState),
    isCompleted,
    handleCanvasLoaded,
  };
}
