<script setup lang="ts">
import { ref, onMounted } from 'vue';
import useFabric from '@/hooks/useFabric';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  page: number;
}

const props = defineProps<Props>();
const isShowCanvas = ref(false);

const canvasId = `canvas_page_${props.page - 1}`;
const { createCanvas, specifyPage, renderImage } = useFabric(canvasId);

async function setPDF() {
  const { file, page } = props;

  createCanvas();
  file.PDFBase64.startsWith('data:image') 
    ? renderImage({ url: file.PDFBase64, scale: 0.4 })
    : await specifyPage({ page: page, PDF: file, scale: 0.4 });

  isShowCanvas.value = true;
}

onMounted(setPDF);
</script>

<template>
  <canvas
    v-show="isShowCanvas"
    :id="canvasId"
    class="border-2 border-gray-20"
  ></canvas>
</template>
