<script setup lang="ts">
import { BlobImage } from '@/components/common';
import type { StoredOverlay } from '@/types/pdf';

interface Props {
  overlays: readonly StoredOverlay[];
}

defineProps<Props>();

function toStyle({ x, y, width, height }: StoredOverlay) {
  return { left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` };
}
</script>

<template>
  <blob-image
    v-for="(overlay, index) in overlays"
    :key="index"
    :blob="overlay.image"
    :style="toStyle(overlay)"
    class="pointer-events-none absolute max-w-none"
    alt="signature"
  />
</template>
