<script setup lang="ts">
import { computed } from 'vue';
import { createImageSrc } from '@/utils/image';

interface Props {
  icon: string;
  customClass?: string;
  isActive?: boolean;
}

const props = defineProps<Props>();
const hover = computed(() => {
  return `url('${createImageSrc(`icon/ic_${props.icon}_h.svg`)}')`;
});
</script>

<template>
  <img
    :src="createImageSrc(`icon/ic_${icon}${isActive ? '_h' : '' }.svg`)"
    :class="['bg-contain cursor-pointer transition-opacity duration-500', customClass]"
  />
</template>

<style lang="postcss" scoped>
img:hover {
  @apply content-[v-bind(hover)];
}
</style>
