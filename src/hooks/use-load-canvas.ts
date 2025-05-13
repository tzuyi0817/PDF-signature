import { computed, onBeforeUnmount, readonly, ref, watch, type Ref } from 'vue';
import { sleep, throttle } from '@/utils/common';
import type { PDF } from '@/types/pdf';
import type CanvasItem from '@component-hook/pdf-canvas/vue';

export function useLoadCanvas(currentPDF: Ref<PDF>, isObserveResize = false) {
  const currentPage = ref(1);
  const loadedState = ref<boolean[]>([]);
  const loadedPages = ref(-1);
  const canvasItems = ref<InstanceType<typeof CanvasItem>[] | null>(null);
  const canvasRect = ref<Record<'height' | 'width', number>>({ height: 0, width: 0 });
  const resizeObserver = new ResizeObserver(handleCanvasResize);

  const isCompleted = computed(() => loadedPages.value >= currentPDF.value.pages);

  const currentCanvasItem = computed(() => {
    if (!canvasItems.value) return null;

    return canvasItems.value.at(currentPage.value - 1);
  });

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

  function handleCanvasResize(entries: ResizeObserverEntry[]) {
    entries.forEach(({ contentRect }) => {
      canvasRect.value.height = contentRect.height;
      canvasRect.value.width = contentRect.width;
    });
  }

  watch(
    () => currentPDF.value?.pages,
    pages => {
      if (!pages) return;

      loadedPages.value = 0;
      loadedState.value = Array.from({ length: currentPDF.value.pages + 1 }, () => false);
      loadedState.value[0] = true;
    },
    { immediate: true },
  );

  if (isObserveResize) {
    watch(
      () => currentCanvasItem.value?.canvasRef,
      (canvasRef, oldRef) => {
        if (oldRef) {
          resizeObserver.unobserve(oldRef);
        }

        if (canvasRef) {
          resizeObserver.observe(canvasRef);
        }
      },
    );
  }

  onBeforeUnmount(() => {
    resizeObserver.disconnect();
  });

  return {
    currentPage,
    canvasItems,
    loadedState: readonly(loadedState),
    canvasRect: readonly(canvasRect),
    isCompleted,
    currentCanvasItem,
    handleCanvasLoaded,
    handleCanvasReload,
  };
}
