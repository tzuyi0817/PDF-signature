<script setup lang="ts">
const model = defineModel<number>({ required: true });
const MAX_ZOOM = 1.5;
const MIN_ZOOM = 0.5;

function changeZoom(value: number) {
  model.value += value;
}
</script>

<template>
  <div class="signature_magnifier">
    <button
      class="btn_small btn_primary"
      :disabled="modelValue >= MAX_ZOOM"
      @click="changeZoom(0.1)"
    >
      ➕
    </button>
    <button
      class="btn_small btn_primary"
      :disabled="modelValue <= MIN_ZOOM"
      @click="changeZoom(-0.1)"
    >
      ➖
    </button>
  </div>
</template>

<style lang="postcss" scoped>
.signature_magnifier {
  @apply absolute bottom-[106px] right-10 flex gap-[2px] md:bottom-20 md:right-[calc(5%+45px)] md:gap-1;
  .btn_small {
    @apply text-transparent;
    text-shadow: 0 0 0 #b7ec5d;
    &:hover {
      text-shadow: 0 0 0 #000;
    }
    &:disabled {
      text-shadow: 0 0 0 #808080;
    }
  }
}
</style>
