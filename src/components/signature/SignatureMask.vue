<script setup lang="ts">
interface Props {
  isShowMask: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);
</script>

<template>
  <div
    :class="['mask bg-black/50', isShowMask ? 'opacity-100 z-0' : 'opacity-0 -z-[1]']"
    @click="emit('close', false)"
  ></div>
</template>