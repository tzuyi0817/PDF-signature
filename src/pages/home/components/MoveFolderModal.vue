<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Popup, showToast, SvgIcon } from '@/components/common';
import { useFolderStore, usePdfStore } from '@/stores';
import type { Folder } from '@/types/folder';

interface Props {
  /** 要移動的檔案 ID 集合 */
  pdfIds: Set<string>;
}

interface Emits {
  close: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();
const moving = ref(false);
const folderStore = useFolderStore();
const { folderList } = storeToRefs(folderStore);

/** 在 modal 裡瀏覽的目標資料夾 ID */
const browsingFolderId = ref<string | null>(null);

/** 目前瀏覽層的子資料夾 */
const currentChildren = computed(() => {
  return folderList.value.filter(folder => folder.parentId === browsingFolderId.value);
});

/** 目前瀏覽層的麵包屑路徑 */
const modalBreadcrumbs = computed(() => {
  const result: Pick<Folder, 'folderId' | 'name'>[] = [];
  const folderMap = new Map(folderList.value.map(folder => [folder.folderId, folder]));
  let currentId = browsingFolderId.value;

  while (currentId !== null) {
    const folder = folderMap.get(currentId);

    if (!folder) break;

    result.unshift({ folderId: folder.folderId, name: folder.name });
    currentId = folder.parentId;
  }

  return result;
});

function navigateTo(folderId: string | null) {
  browsingFolderId.value = folderId;
}

function confirmMove() {
  const { moveFilesToFolder } = usePdfStore();

  moving.value = true;
  moveFilesToFolder(props.pdfIds, browsingFolderId.value)
    .then(() => {
      showToast(t('folder.moved'));
      emit('close');
    })
    .finally(() => {
      moving.value = false;
    });
}
</script>

<template>
  <popup
    :title="t('folder.move_to')"
    @close-popup="emit('close')"
  >
    <div class="flex flex-1 flex-col gap-4 py-4">
      <!-- 麵包屑導覽 -->
      <nav class="flex items-center gap-1 px-4 text-sm">
        <button
          class="text-breadcrumbs shrink-0 cursor-pointer font-medium hover:underline"
          @click="navigateTo(null)"
        >
          {{ t('folder.root') }}
        </button>

        <template
          v-for="crumb in modalBreadcrumbs"
          :key="crumb.folderId"
        >
          <svg-icon
            name="chevron_right"
            class="text-gray-40 h-4 w-4 shrink-0"
            disabled
          />
          <button
            :class="[
              'max-w-30 shrink-0 truncate font-medium',
              crumb.folderId === browsingFolderId
                ? 'text-surface-text'
                : 'text-breadcrumbs cursor-pointer hover:underline',
            ]"
            :disabled="crumb.folderId === browsingFolderId"
            @click="navigateTo(crumb.folderId)"
          >
            {{ crumb.name }}
          </button>
        </template>
      </nav>

      <!-- 資料夾清單 -->
      <ul class="flex max-h-60 flex-1 flex-col overflow-auto">
        <li
          v-for="folder in currentChildren"
          :key="folder.folderId"
          class="hover:bg-gray-10 dark:hover:bg-gray-70 mx-4 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors"
          @click="navigateTo(folder.folderId)"
        >
          <svg-icon
            name="folder"
            class="text-primary h-8 w-8 shrink-0"
          />
          <span class="flex-1 truncate">{{ folder.name }}</span>
          <svg-icon
            name="chevron_right"
            class="text-gray-40 h-4 w-4 shrink-0"
            disabled
          />
        </li>

        <li
          v-if="currentChildren.length === 0"
          class="text-gray-40 flex flex-1 items-center justify-center text-sm"
        >
          {{ t('folder.no_subfolders') }}
        </li>
      </ul>

      <!-- 操作按鈕 -->
      <div class="flex justify-between lg:justify-evenly">
        <button
          class="btn btn-base"
          @click="emit('close')"
        >
          {{ t('not_yet') }}
        </button>
        <button
          class="btn btn-primary"
          @click="confirmMove"
        >
          {{ t('folder.move_here') }}
        </button>
      </div>
    </div>
  </popup>
</template>
