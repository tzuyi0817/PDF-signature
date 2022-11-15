<script setup lang="ts">
import { computed } from 'vue';
import { createImageSrc } from '@/utils/image';

interface Props {
  icon: string;
  customClass: string;
}

const props = defineProps<Props>();
const hover = computed(() => {
  return `url('${createImageSrc(`icon/ic_${props.icon}_h.svg`)}')`;
})
</script>

<template>
  <img
    :src="createImageSrc(`icon/ic_${icon}.svg`)"
    :class="['bg-contain cursor-pointer', customClass]"
  />
</template>

<style lang="postcss" scoped>
img:hover {
  @apply content-[v-bind(hover)];
}
</style>
