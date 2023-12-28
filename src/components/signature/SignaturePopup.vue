<script setup lang="ts">
import SignatureMask from '@/components/signature/SignatureMask.vue';

interface Props {
  isShowPopup: boolean;
  title: string;
  isDisabled: boolean;
  customUseBtnName?: string;
}

defineProps<Props>();
const emit = defineEmits(['close', 'use']);

function close() {
  emit('close', false);
}
</script>

<template>
  <signature-mask
    :is-show-mask="isShowPopup"
    @close="close"
  />
  <div :class="['signature_popup z-[1]', isShowPopup ? 'translate-y-0 md:block' : 'translate-y-[100%] md:hidden']">
    <h5 class="title text-center md:hidden">{{ title }}</h5>
    <div class="signature_popup_content">
      <slot></slot>
    </div>
    <div class="flex justify-center gap-5 md:hidden">
      <button
        class="btn btn_base"
        @click="close"
      >
        取消
      </button>
      <button
        class="btn btn_primary"
        :disabled="isDisabled"
        @click="emit('use')"
      >
        {{ customUseBtnName ?? '使用' }}
      </button>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.signature_popup {
  @apply fixed
  bottom-0
  left-0
  h-[70%]
  bg-white
  w-full
  rounded-t-[40px]
  transition-transform

  shadow-inner
  py-6
  px-8
  md:absolute
  md:-translate-y-12
  md:w-[236px]
  md:h-[calc(100%-210px)]
  md:py-0
  md:px-0
  md:bg-secondary-tint
  md:rounded-b-[40px]
  md:translate-x-11;
  &_content {
    @apply my-6
    h-[calc(100%-128px)]
    w-full
    bg-secondary-tint
    rounded-[20px]
    overflow-y-auto
    md:my-0
    md:h-full;
  }
}
</style>
