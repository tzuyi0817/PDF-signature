<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from 'vue';

interface Props {
  blob?: Blob;
  alt?: string;
}

defineOptions({ name: 'BlobImage' });

const { blob } = defineProps<Props>();
const src = ref('');

function cleanupObjectURL() {
  if (!src.value) return;

  URL.revokeObjectURL(src.value);
}

watch(
  () => blob,
  newBlob => {
    cleanupObjectURL();

    if (!newBlob) return;

    const url = URL.createObjectURL(newBlob);

    src.value = url;
  },
  { immediate: true },
);

onBeforeUnmount(cleanupObjectURL);
</script>

<template>
  <img
    :src="src"
    :alt="alt"
  />
</template>
