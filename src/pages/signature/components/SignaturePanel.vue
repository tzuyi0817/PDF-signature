<script setup lang="ts">
import { Describedby } from '@/components/common';
import SignIcon from '@/components/SignIcon.vue';

interface Props {
  isActivatedFabric: boolean;
}

interface Emits {
  copyFabric: [];
  deleteFabric: [];
  watermarkFabric: [];
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
    <describedby :title="$t('copy')">
      <button
        class="btn-small btn-primary"
        :disabled="!isActivatedFabric"
        @click="$emit('copyFabric')"
      >
        <sign-icon
          name="file"
          class="text-primary h-4.5 w-4.5"
        />
      </button>
    </describedby>

    <describedby :title="$t('delete')">
      <button
        class="btn-small btn-primary"
        :disabled="!isActivatedFabric"
        @click="$emit('deleteFabric')"
      >
        <sign-icon
          name="trash"
          class="text-primary h-4.5 w-4.5"
        />
      </button>
    </describedby>

    <describedby :title="$t('watermark')">
      <button
        class="btn-small btn-primary"
        :disabled="!isActivatedFabric"
        @click="$emit('watermarkFabric')"
      >
        <sign-icon
          name="pic"
          class="text-primary h-4.5 w-4.5"
        />
      </button>
    </describedby>

    <describedby :title="$t('zoom_in')">
      <button
        class="btn-small btn-primary text-xs"
        :disabled="fileZoom >= MAX_ZOOM"
        @click="changeZoom(0.1)"
      >
        ➕
      </button>
    </describedby>

    <describedby :title="$t('zoom_out')">
      <button
        class="btn-small btn-primary text-xs"
        :disabled="fileZoom <= MIN_ZOOM"
        @click="changeZoom(-0.1)"
      >
        ➖
      </button>
    </describedby>
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
  min-width: 46px;
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
