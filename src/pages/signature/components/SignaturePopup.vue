<script setup lang="ts">
import SignatureMask from './SignatureMask.vue';

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
  <div :class="['signature-popup z-[1]', isShowPopup ? 'translate-y-0 md:block' : 'translate-y-[100%] md:hidden']">
    <h5 class="title text-center md:hidden">
      {{ title }}
    </h5>
    <div class="signature-popup-content">
      <slot></slot>
    </div>
    <div class="flex justify-center gap-5 md:hidden">
      <button
        class="btn btn-base"
        @click="close"
      >
        {{ $t('cancel') }}
      </button>
      <button
        class="btn btn-primary"
        :disabled="isDisabled"
        @click="emit('use')"
      >
        {{ customUseBtnName ?? $t('use') }}
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.signature-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 70%;
  background-color: var(--color-white);
  width: 100%;
  border-radius: 40px 40px 0 0;
  transition: translate 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  padding: 24px 32px;
}

@media (min-width: 768px) {
  .signature-popup {
    position: absolute;
    transform: translate(44px, -48px);
    width: 236px;
    height: calc(100% - 210px);
    padding: 0;
    background-color: var(--color-secondary-tint);
    border-radius: 40px;
  }
}

.signature-popup-content {
  margin: 24px 0;
  height: calc(100% - 128px);
  width: 100%;
  background-color: var(--color-secondary-tint);
  border-radius: 20px;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .signature-popup-content {
    margin: 0;
    height: 100%;
  }
}
</style>
