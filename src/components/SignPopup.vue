<script setup lang="ts">
import { onMounted } from 'vue';

interface Props {
  title: string;
}

defineProps<Props>();
const emit = defineEmits(['childMounted']);

onMounted(() => emit('childMounted'));
</script>

<template>
  <teleport to="body">
    <div class="sign_popup mask">
      <div class="sign_popup_box">
        <h5 class="border-b-2 border-primary py-1 px-4 text-center font-medium md:pb-4">{{ title }}</h5>
        <slot></slot>
      </div>
    </div>
  </teleport>
</template>

<style lang="postcss" scoped>
.sign_popup {
  @apply bg-black/50 flex items-center justify-center z-[2];
  &_box {
    @apply w-[90%]
    max-w-[530px]
    min-h-[261px]
    px-8
    pt-4
    pb-7
    shadow-[0px_4px_15px_rgba(0,0,0,0.2),inset_0px_2px_5px_rgba(135,135,135,0.2),inset_0px_3px_10px_rgba(215,215,215,0.2),inset_0px_-1px_4px_rgba(135,135,135,0.6),inset_0px_-6px_6px_rgba(215,215,215,0.4)]
    rounded-[40px]
    flex
    flex-col
    justify-between
    bg-white
    md:min-h-[335px]
    md:max-h-[566px];
  }
}
</style>
