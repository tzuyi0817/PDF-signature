import { ref, readonly, computed, watch, type Ref } from 'vue';
import type CanvasItem from '@component-hook/pdf-canvas/vue';
import { sleep, throttle } from '@/utils/common';
import type { PDF } from '@/types/pdf';

export function useLoadCanvas(currentPDF: Ref<PDF>) {
  const loadedState = ref<boolean[]>([]);
  const loadedPages = ref(-1);
  const canvasItems = ref<InstanceType<typeof CanvasItem>[] | null>(null);

  const isCompleted = computed(() => loadedPages.value >= currentPDF.value.pages);

  const handleCanvasReload = throttle(async () => {
    if (!loadedPages.value) return;

    loadedPages.value = 0;
    await reloadCanvas(0);
  }, 1000);

  async function handleCanvasLoaded(page: number) {
    await sleep(100);
    loadedState.value[page] = true;
    loadedPages.value += 1;
  }

  async function reloadCanvas(page: number) {
    if (page >= currentPDF.value.pages) return;

    await canvasItems.value?.[page].reload();
    await sleep(300);
    await reloadCanvas(page + 1);
  }

  watch(
    () => currentPDF.value?.pages,
    pages => {
      console.log('pages', pages);
      if (!pages) return;

      loadedPages.value = 0;
      loadedState.value = Array.from({ length: currentPDF.value.pages + 1 }, () => false);
      loadedState.value[0] = true;
    },
    { immediate: true },
  );

  return {
    canvasItems,
    loadedState: readonly(loadedState),
    isCompleted,
    handleCanvasLoaded,
    handleCanvasReload,
  };
}
