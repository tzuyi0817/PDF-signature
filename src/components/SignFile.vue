<script setup lang="ts">
import { computed, onMounted } from 'vue';
import useFabric from '@/hooks/useFabric';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF;
  index: number;
}

const props = defineProps<Props>();
const canvasId = `canvas${props.index}`;
const { createCanvas, specifyPage } = useFabric(canvasId);

const time = computed(() => {
  const [iso] = new Date(props.file.updateDate).toISOString().split('.');

  return iso.replace(/T/, ' ');
});

function setPDF() {
  createCanvas();
  // specifyPage(1, props.file);
}

onMounted(setPDF);
</script>

<template>
  <li class="sign_file">
    <canvas :id="canvasId" class="border-2 border-gray-20"></canvas>
    <p class="mb-1">{{ file.name }}</p>
    <p class="text-gray-40">{{ time }}</p>
  </li>
</template>

<style lang="postcss" scoped>
.sign_file {
  @apply
  border-[2px]
  border-secondary-tint
  p-4
  flex
  flex-col
  items-center
  rounded-[20px]
  shadow-md
  justify-center;
}
</style>