<script setup lang="ts">
import { ref, onMounted } from 'vue';
import useFabric from '@/hooks/useFabric';
import { isDesktop } from '@/utils/common';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  page: number;
}

const props = defineProps<Props>();
const canvasDom = ref<HTMLCanvasElement | null>(null);
const canvasId = `canvas${props.page - 1}`;
const { createCanvas, specifyPage, addFabric, addTextFabric, renderImage, clearActive } = useFabric(canvasId);

async function setPDF() {
  const { file, page } = props;
  const scale = isDesktop() ? 4 : 2;

  createCanvas();
  file.PDFBase64.startsWith('data:image')
    ? renderImage({ url: file.PDFBase64, scale })
    : await specifyPage({ page: page, PDF: file, scale });
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

onMounted(setPDF);
defineExpose({ addFabric, addTextFabric, clearActive, canvasDom });
</script>

<template>
  <div
    class="absolute py-5 px-3 md:py-10 md:px-14"
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
