<script setup lang="ts">
import { ref, onMounted } from 'vue';
import useFabric from '@/hooks/useFabric';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  page: number;
}

const props = defineProps<Props>();
const canvasDom = ref<HTMLCanvasElement | null>(null);
const canvasId = `canvas${props.page - 1}`;
const { createCanvas, specifyPage, addFabric, addTextFabric, renderImage } = useFabric(canvasId);

async function setPDF() {
  const { file, page } = props;

  createCanvas();
  file.PDFBase64.startsWith('data:image') 
    ? renderImage({ url: file.PDFBase64, scale: 2 })
    : await specifyPage({ page: page, PDF: file, scale: 2 });
}

onMounted(setPDF);
defineExpose({ addFabric, addTextFabric, canvasDom });
</script>

<template>
  <div class="absolute py-5 px-3">
    <canvas :id="canvasId" ref="canvasDom"></canvas>
  </div>
</template>