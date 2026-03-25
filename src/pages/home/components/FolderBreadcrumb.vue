<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@/components/common';
import { useFolderStore } from '@/stores';

defineOptions({ name: 'FolderBreadcrumb' });

const folderStore = useFolderStore();
const { breadcrumbs, currentFolderId } = storeToRefs(folderStore);
const { t } = useI18n();

function navigateTo(folderId: string | null) {
  folderStore.navigateTo(folderId);
}
</script>

<template>
  <nav class="flex flex-wrap items-center gap-1 px-4 py-2 text-sm">
    <button
      :class="['shrink-0 font-medium', currentFolderId === null ? 'text-surface-text' : 'breadcrumbs-active']"
      :disabled="currentFolderId === null"
      @click="navigateTo(null)"
    >
      {{ t('folder.all_files') }}
    </button>

    <template
      v-for="crumb in breadcrumbs"
      :key="crumb.folderId"
    >
      <svg-icon
        name="chevron_right"
        class="text-gray-40 h-4 w-4 shrink-0"
        disabled
      />
      <button
        :class="[
          'max-w-40 shrink-0 truncate font-medium',
          crumb.folderId === currentFolderId ? 'text-surface-text' : 'breadcrumbs-active',
        ]"
        :disabled="crumb.folderId === currentFolderId"
        @click="navigateTo(crumb.folderId)"
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
</style>
