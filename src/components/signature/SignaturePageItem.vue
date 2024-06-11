<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import useFabric from '@/hooks/useFabric';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  page: number;
}

const props = defineProps<Props>();
const isShowCanvas = ref(false);

const canvasId = `canvas_page_${props.page - 1}`;
const { createCanvas, specifyPage, renderImage, deleteCanvas } = useFabric(canvasId);

async function setPDF() {
  const { file, page } = props;

  createCanvas();
  if (file.PDFBase64.startsWith('data:image') || file.canvas) {
    const { canvas } = file;
    const url = canvas ? canvas[page - 1] : file.PDFBase64;

    renderImage({ url, scale: canvas ? 0.05 : 0.2 });
  } else {
    await specifyPage({ page, PDF: file, scale: 0.3 });
  }
  isShowCanvas.value = true;
}

onMounted(setPDF);
onBeforeUnmount(deleteCanvas);
</script>

<template>
  <canvas
    v-show="isShowCanvas"
    :id="canvasId"
    class="border-2 border-gray-20"
  ></canvas>
</template>
