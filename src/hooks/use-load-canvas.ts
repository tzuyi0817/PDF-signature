import { computed, onBeforeUnmount, readonly, ref, watch, type ComputedRef, type Ref } from 'vue';
import { sleep, throttle } from '@/utils/common';
import type { PDF } from '@/types/pdf';
import type CanvasItem from '@component-hook/pdf-canvas/vue';

type CanvasItemInstance = InstanceType<typeof CanvasItem>;
type CanvasRect = Record<'height' | 'width', number>;

interface LoadCanvasReturn {
  currentPage: Ref<number>;
  canvasItems: Ref<CanvasItemInstance[] | null>;
  loadedState: Readonly<Ref<readonly boolean[]>>;
  canvasRect: Readonly<Ref<CanvasRect>>;
  isCompleted: ComputedRef<boolean>;
  currentCanvasItem: ComputedRef<CanvasItemInstance | null | undefined>;
  handleCanvasLoaded: (page: number) => Promise<void>;
  handleCanvasReload: () => void;
}

export function useLoadCanvas(currentPDF: Ref<PDF>, isObserveResize = false): LoadCanvasReturn {
  const currentPage = ref(1);
  const loadedState = ref<boolean[]>([]);
  const loadedPages = ref(-1);
  const canvasItems = ref<CanvasItemInstance[] | null>(null);
  const canvasRect = ref<CanvasRect>({ height: 0, width: 0 });
  const resizeObserver = new ResizeObserver(handleCanvasResize);
  let reloadId: number | null = null;

  const isCompleted = computed(() => loadedPages.value >= currentPDF.value.pages);

  const currentCanvasItem = computed(() => {
    if (!canvasItems.value) return null;

    return canvasItems.value.at(currentPage.value - 1);
  });

  const handleCanvasReload = throttle(async () => {
    if (!loadedPages.value) return;

    reloadId = Date.now();
    loadedPages.value = 0;
    await reloadCanvas(0, reloadId);
  }, 1000);

  async function handleCanvasLoaded(page: number) {
    await sleep(100);
    loadedState.value[page] = true;
    loadedPages.value += 1;
  }

  async function reloadCanvas(page: number, id: number) {
    if (page >= currentPDF.value.pages || !canvasItems.value || id !== reloadId) return;

    await canvasItems.value[page]?.reload();
    await sleep(300);
    await reloadCanvas(page + 1, id);
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
