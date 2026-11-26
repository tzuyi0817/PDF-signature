<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { useInView } from '@/hooks/use-in-view';
import { releaseCanvas } from '@/utils/canvas';
import { toPixelWidth, type PageSize, type PreviewDocument } from '@/utils/pdf-preview';
import CompletePreviewOverlays from './CompletePreviewOverlays.vue';
import type { StoredOverlay } from '@/types/pdf';

interface Props {
  preview: PreviewDocument;
  pageNumber: number;
  size: PageSize;
  overlays: readonly StoredOverlay[];
  scrollRoot: HTMLElement | null;
}

const { preview, pageNumber, scrollRoot } = defineProps<Props>();
const pageRef = useTemplateRef('pageRef');
const canvasRef = useTemplateRef('canvasRef');
const { isInView } = useInView({ target: pageRef, root: () => scrollRoot, rootMargin: '100% 0px' });
let rendering: Promise<unknown> = Promise.resolve();

watch(isInView, (isNear, _, onCleanup) => {
  const canvas = canvasRef.value;

  if (!isNear || !canvas) return;

  const controller = new AbortController();
  const pixelWidth = toPixelWidth(canvas.getBoundingClientRect().width, window.devicePixelRatio);

  rendering = rendering
    .then(() => preview.renderPage(pageNumber, canvas, pixelWidth, controller.signal))
    .catch(() => {});

  onCleanup(() => {
    controller.abort();
    releaseCanvas(canvas);
  });
});
</script>

<template>
  <div
    ref="pageRef"
    class="relative w-full bg-white"
    :style="{ aspectRatio: `${size.width} / ${size.height}` }"
  >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 h-full w-full"
      width="0"
      height="0"
      role="img"
      aria-label="PDF document"
    ></canvas>

    <complete-preview-overlays
      v-if="isInView"
      :overlays
    />
  </div>
</template>
