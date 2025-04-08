<script setup lang="ts">
const model = defineModel<number>({ required: true });
const MAX_ZOOM = 1.5;
const MIN_ZOOM = 0.5;

function changeZoom(value: number) {
  model.value += value;
}
</script>

<template>
  <div class="signature-magnifier">
    <button
      class="btn-small btn-primary"
      :disabled="modelValue >= MAX_ZOOM"
      @click="changeZoom(0.1)"
    >
      ➕
    </button>
    <button
      class="btn-small btn-primary"
      :disabled="modelValue <= MIN_ZOOM"
      @click="changeZoom(-0.1)"
    >
      ➖
    </button>
  </div>
</template>

<style lang="css" scoped>
.signature-magnifier {
  position: absolute;
  bottom: 106px;
  right: 40px;
  display: flex;
  gap: 2px;
}

@media (min-width: 768px) {
  .signature-magnifier {
    bottom: 80px;
    right: calc(5% + 45px);
    gap: 4px;
  }
}

.signature-magnifier .btn-small {
  text-shadow: 0 0 0 #b7ec5d;
  color: transparent;
}

.signature-magnifier .btn-small:hover {
  text-shadow: 0 0 0 #000;
}

.signature-magnifier .btn-small:disabled {
  text-shadow: 0 0 0 #808080;
}
</style>
