<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRedirect } from '@/hooks/use-redirect';
import { useFolderStore, usePdfStore } from '@/stores';
import CreateFolderDialog from './CreateFolderDialog.vue';
import FolderBreadcrumb from './FolderBreadcrumb.vue';
import HomeSearch from './HomeSearch.vue';
import HomeSignFiles from './HomeSignFiles.vue';
import type { Folder } from '@/types/folder';

const { goPage } = useRedirect();
const pdfStore = usePdfStore();
const folderStore = useFolderStore();
const { PDFList } = storeToRefs(pdfStore);
const { currentFolderId } = storeToRefs(folderStore);
const keyword = ref('');
const isShowCreateFolder = ref(false);
const renameTarget = ref<Folder>();

/** 目前資料夾底下的檔案 */
const filesInFolder = computed(() => {
  const fid = currentFolderId.value;

  if (fid === null) {
    return PDFList.value.filter(pdf => !pdf.folderId);
  }

  return PDFList.value.filter(pdf => pdf.folderId === fid);
});

/** 目前資料夾底下的子資料夾 */
const foldersInView = computed(() => folderStore.childFolders(currentFolderId.value));

/** 目前層級是否有項目 */
const hasItemsInFolder = computed(() => filesInFolder.value.length > 0 || foldersInView.value.length > 0);

function openCreateFolder() {
  renameTarget.value = undefined;
  isShowCreateFolder.value = true;
}

function openRenameDialog(folder: Folder) {
  renameTarget.value = folder;
  isShowCreateFolder.value = true;
}

function closeCreateFolder() {
  isShowCreateFolder.value = false;
  renameTarget.value = undefined;
}

function navigateToFolder(folderId: string) {
  folderStore.navigateTo(folderId);
}
</script>

<template>
  <div class="index-files index-container relative">
    <home-search
      v-if="hasItemsInFolder"
      v-model="keyword"
    />

    <folder-breadcrumb />

    <home-sign-files
      v-if="hasItemsInFolder"
      type="file"
      :list="filesInFolder"
      :folders="foldersInView"
      :keyword
      @navigate-folder="navigateToFolder"
      @open-rename-dialog="openRenameDialog"
      @open-create-folder="openCreateFolder"
    />

    <div
      v-else
      class="flex h-full flex-col items-center justify-center gap-5"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt="create file"
        class="iconScale h-20 w-20 cursor-pointer lg:h-34 lg:w-34"
        @click="goPage('upload')"
      />

      <h3 class="text-center">{{ $t('prompt.create_file') }}</h3>

      <button
        class="index-files-create-folder"
        @click="openCreateFolder"
      >
        <img
          src="@/assets/icon/ic_folder_new_dark.svg"
          alt="create folder"
          class="h-6 w-6"
        />
        <span class="text-sm">{{ $t('folder.create') }}</span>
      </button>
    </div>

    <create-folder-dialog
      v-if="isShowCreateFolder"
      :rename-target="renameTarget"
      @close="closeCreateFolder"
    />
  </div>
</template>

<style lang="css" scoped>
.index-files-create-folder {
  margin-top: 8px;
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px dashed var(--color-gray-40);
  border-radius: 8px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: var(--color-primary);
    color: black;
  }
}
</style>
