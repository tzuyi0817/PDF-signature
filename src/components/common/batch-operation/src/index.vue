<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { showToast, SvgIcon } from '@/components/common';
import { useFolderStore, usePdfStore } from '@/stores';
import type { Folder } from '@/types/folder';
import type { MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  type: MenuTab;
  batch: Set<PDF>;
  folderBatch: Set<Folder>;
}

interface Emits {
  clearBatch: [];
  openWarnPopup: [];
  batchMoveToFolder: [];
}

defineOptions({ name: 'BatchOperation' });

const { batch, folderBatch, type } = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

async function batchMoveToArchive() {
  const { batchAddArchive } = usePdfStore();

  if (folderBatch.size > 0) {
    showToast({ message: t('folder.cannot_archive'), type: 'warn' });
  }

  if (batch.size > 0) {
    await batchAddArchive(batch);
  }

  emit('clearBatch');
}

async function batchMoveToTrash() {
  const { batchAddTrash, orphanFilesToRoot } = usePdfStore();
  const promises: Promise<unknown>[] = [];

  if (batch.size > 0) {
    promises.push(batchAddTrash(batch, type));
  }

  if (folderBatch.size > 0) {
    const { batchDeleteFolders } = useFolderStore();
    const folderIds = new Set([...folderBatch].map(f => f.folderId));
    const { deletedIds, promise } = batchDeleteFolders(folderIds);

    orphanFilesToRoot(deletedIds);
    promises.push(promise);
  }

  await Promise.all(promises);
  emit('clearBatch');
}

async function batchReduction() {
  if (type === 'archive') {
    const { batchReductionArchive } = usePdfStore();

    await batchReductionArchive(batch);
  } else {
    const { batchReductionTrash } = usePdfStore();

    await batchReductionTrash(batch);
  }

  emit('clearBatch');
}
</script>

<template>
  <div class="flex gap-3">
    <!-- 批次移動到資料夾按鈕 -->
    <svg-icon
      v-if="type === 'file'"
      name="folder_move"
      class="h-6 w-6"
      @click="$emit('batchMoveToFolder')"
    />
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
