<script lang="ts" setup>
import { SvgIcon } from '@/components/common';
import { usePdfStore } from '@/stores';
import type { MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  type: MenuTab;
  batch: Set<PDF>;
}

defineOptions({ name: 'BatchOperation' });

const { batch, type } = defineProps<Props>();
const emit = defineEmits(['clearBatch', 'openWarnPopup']);
const { batchAddArchive, batchAddTrash, batchReductionArchive, batchReductionTrash } = usePdfStore();

async function batchMoveToArchive() {
  await batchAddArchive(batch);
  emit('clearBatch');
}

async function batchMoveToTrash() {
  await batchAddTrash(batch, type);
  emit('clearBatch');
}

async function batchReduction() {
  if (type === 'archive') {
    await batchReductionArchive(batch);
  } else {
    await batchReductionTrash(batch);
  }
  emit('clearBatch');
}
</script>

<template>
  <div class="flex gap-3">
    <svg-icon
      v-if="type === 'file'"
      name="archive"
      class="h-6 w-6"
      @click="batchMoveToArchive"
    />
    <svg-icon
      v-if="type === 'archive' || type === 'trash'"
      name="reduction"
      class="h-6 w-6"
      @click="batchReduction"
    />
    <svg-icon
      v-if="type === 'file' || type === 'archive'"
      name="trash"
      class="h-6 w-6"
      @click="batchMoveToTrash"
    />
    <svg-icon
      v-if="type === 'trash'"
      name="trash"
      class="h-6 w-6"
      @click="$emit('openWarnPopup')"
    />
  </div>
</template>
