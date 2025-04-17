<script setup lang="ts">
import SignIcon from '@/components/SignIcon.vue';

interface Props {
  isActivatedFabric: boolean;
}

interface Emits {
  copyFabric: [];
  deleteFabric: [];
}

defineProps<Props>();
defineEmits<Emits>();

const fileZoom = defineModel<number>('fileZoom', { required: true });
const MAX_ZOOM = 1.5;
const MIN_ZOOM = 0.5;

function changeZoom(value: number) {
  fileZoom.value += value;
}
</script>

<template>
  <div class="signature-panel">
    <button
      class="btn-small btn-primary"
      :disabled="!isActivatedFabric"
      @click="$emit('copyFabric')"
    >
      <sign-icon
        name="file"
        class="w-4.5 h-4.5 text-primary"
      />
    </button>

    <button
      class="btn-small btn-primary"
      :disabled="!isActivatedFabric"
      @click="$emit('deleteFabric')"
    >
      <sign-icon
        name="trash"
        class="w-4.5 h-4.5 text-primary"
      />
    </button>

    <button
      class="btn-small btn-primary text-xs"
      :disabled="fileZoom >= MAX_ZOOM"
      @click="changeZoom(0.1)"
    >
      ➕
    </button>
    <button
      class="btn-small btn-primary text-xs"
      :disabled="fileZoom <= MIN_ZOOM"
      @click="changeZoom(-0.1)"
    >
      ➖
    </button>
  </div>
</template>

<style lang="css" scoped>
.signature-panel {
  padding: 4px 16px;
  background: white;
  border: 2px solid var(--color-primary);
  box-shadow: 0 1px 3px 0 var(--color-primary);
  border-radius: 20px;
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
}

@media (min-width: 768px) {
  .signature-panel {
    gap: 8px;
    padding: 4px 20px;
  }
}

.signature-panel .btn-small {
  text-shadow: 0 0 0 #b7ec5d;
  color: transparent;
}

.signature-panel .btn-small:hover {
  text-shadow: 0 0 0 #000;

  svg {
    color: #000;
  }
}

.signature-panel .btn-small:disabled {
  text-shadow: 0 0 0 #808080;

  svg {
    color: #808080;
  }
}
</style>
