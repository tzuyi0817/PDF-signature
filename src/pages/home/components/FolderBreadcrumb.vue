<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@/components/common';
import { useDragMove } from '@/hooks/use-drag-move';
import { useFolderStore } from '@/stores';

interface CrumbItem {
  /** 麵包屑節點對應的資料夾 ID，根目錄為 null */
  folderId: string | null;
  name: string;
}

defineOptions({ name: 'FolderBreadcrumb' });

const folderStore = useFolderStore();
const { breadcrumbs, currentFolderId } = storeToRefs(folderStore);
const { t } = useI18n();
const {
  isDragOverTarget,
  isDropCandidate,
  onDropTargetDragEnter,
  onDropTargetDragOver,
  onDropTargetDragLeave,
  onDropTargetDrop,
} = useDragMove();

/** 根目錄與各層資料夾統一為麵包屑節點，供 template 以單一迴圈渲染 */
const crumbItems = computed<CrumbItem[]>(() => [{ folderId: null, name: t('folder.all_files') }, ...breadcrumbs.value]);

function navigateTo(folderId: string | null) {
  folderStore.navigateTo(folderId);
}
</script>

<template>
  <nav class="flex flex-wrap items-center gap-1 px-4 py-2 text-sm">
    <template
      v-for="(crumb, index) in crumbItems"
      :key="crumb.folderId ?? 'root'"
    >
      <svg-icon
        v-if="index > 0"
        name="chevron_right"
        class="text-gray-40 h-4 w-4 shrink-0"
        disabled
      />
      <button
        :class="[
          'shrink-0 font-medium',
          crumb.folderId === currentFolderId ? 'text-surface-text' : 'breadcrumbs-active',
          {
            'max-w-40 truncate': index > 0,
            'drop-candidate': isDropCandidate(crumb.folderId),
            'drop-target': isDragOverTarget(crumb.folderId),
          },
        ]"
        :disabled="crumb.folderId === currentFolderId"
        @click="navigateTo(crumb.folderId)"
        @dragenter="onDropTargetDragEnter($event, crumb.folderId)"
        @dragover="onDropTargetDragOver($event, crumb.folderId)"
        @dragleave="onDropTargetDragLeave(crumb.folderId)"
        @drop="onDropTargetDrop($event, crumb.folderId)"
      >
        {{ crumb.name }}
      </button>
    </template>
  </nav>
</template>

<style lang="css" scoped>
.breadcrumbs-active {
  color: var(--color-breadcrumbs);
  cursor: pointer;
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    text-decoration: underline;
  }
}

.drop-candidate {
  color: var(--color-primary);
  text-decoration: underline dashed;
}

.drop-target {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
