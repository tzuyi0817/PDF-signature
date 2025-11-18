<script setup lang="ts">
interface Props {
  isShowMask: boolean;
}

defineProps<Props>();
const emit = defineEmits(['close']);
</script>

<template>
  <div
    :class="['mask bg-black/50 md:hidden', isShowMask ? 'z-1 opacity-100' : '-z-1 opacity-0']"
    @click="emit('close', false)"
  ></div>
</template>
