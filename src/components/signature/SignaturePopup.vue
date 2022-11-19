<script setup lang="ts">
import SignatureMask from '@/components/signature/SignatureMask.vue';

interface Props {
  isShowPopup: boolean;
  title: string;
  isDisabled: boolean;
  customUseBtnName?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'use']);

function close() {
  emit('close', false);
}
</script>

<template>
  <signature-mask :isShowMask="isShowPopup" @close="close" />
  <div :class="['signature_popup', isShowPopup ? 'translate-y-0' : 'translate-y-[100%]']">
    <h5 class="title text-center">{{ title }}</h5>
    <div class="my-6 h-[calc(100%-128px)] w-full bg-secondary-tint rounded-[20px] overflow-y-auto">
      <slot></slot>
    </div>
    <div class="flex justify-center gap-5">
      <button class="btn btn_base" @click="close">取消</button>
      <button class="btn btn_primary" :disabled="isDisabled" @click="emit('use')">
        {{ customUseBtnName ?? '使用' }}
      </button>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.signature_popup {
  @apply
  fixed
  bottom-0
  left-0
  h-[70%]
  bg-white
  w-full
  rounded-t-[40px]
  transition-transform
  duration-500
  shadow-inner
  py-6
  px-8;
}
</style>