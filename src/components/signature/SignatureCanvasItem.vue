<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
import useFabric from '@/hooks/useFabric';
import { isDesktop } from '@/utils/common';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  page: number;
  fileContainerWidth: number;
}

const props = defineProps<Props>();
const canvasDom = ref<HTMLCanvasElement | null>(null);
const canvasId = `canvas${props.page - 1}`;
const { createCanvas, specifyPage, addFabric, addTextFabric, renderImage, clearActive, deleteCanvas } =
  useFabric(canvasId);

setPDF(props.fileContainerWidth);

async function setPDF(width: number) {
  const SCALE_BASE = 140;
  const { file, page } = props;
  const scale = (width || SCALE_BASE) / SCALE_BASE;

  await nextTick();
  createCanvas();
  file.PDFBase64.startsWith('data:image')
    ? renderImage({ url: file.PDFBase64, scale: isDesktop() ? 2 : 0.7 })
    : await specifyPage({ page, PDF: file, scale });
}

function dropImage(event: DragEvent) {
  const { dataTransfer, offsetX, offsetY } = event;
  const value = dataTransfer?.getData('text/plain');
  if (!value) return;
  const position = {
    x: offsetX - 71,
    y: offsetY - 55,
  };

  value.startsWith('data:image') ? addFabric(value, position) : addTextFabric(value, position);
}

watch(() => props.fileContainerWidth, setPDF);
onBeforeUnmount(deleteCanvas);
defineExpose({ addFabric, addTextFabric, clearActive, deleteCanvas, canvasDom });
</script>

<template>
  <div
    class="absolute py-5 px-3 scale-[0.7] origin-top-left md:py-10 md:px-14"
    @dragover.stop.prevent
    @dragenter.stop.prevent
    @drop.stop.prevent="dropImage"
  >
    <canvas
      :id="canvasId"
      ref="canvasDom"
    ></canvas>
  </div>
</template>
