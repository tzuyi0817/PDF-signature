<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SignFile } from '@/components/biz';
import { BatchOperation, Checkbox, showToast, SvgIcon } from '@/components/common';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { usePdfStore } from '@/stores';
import FolderRow from './FolderRow.vue';
import MoveFolderModal from './MoveFolderModal.vue';
import type { Folder } from '@/types/folder';
import type { FileShowStatus, MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  type: MenuTab;
  list: PDF[];
  folders?: Folder[];
  keyword: string;
}

interface Emits {
  navigateFolder: [folderId: string];
  openRenameDialog: [folder: Folder];
  openCreateFolder: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const showStatus = ref<FileShowStatus>('list');
const iShowEncryptPopup = ref(false);
const isSelectAll = ref<boolean | 'mixed'>(false);
const currentFile = ref<PDF | null>(null);
const isShowMoveModal = ref(false);
const singleMovePdfIds = ref<Set<string>>(new Set());
const movingFolderIds = ref<Set<string>>(new Set());
const batch = new Set<PDF>();
const folderBatch = new Set<Folder>();
const { t } = useI18n();
const { deleteTrash, batchDeleteTrash } = usePdfStore();
const { isShowWarnPopup, Popup, toggleWarnPopup } = useWarnPopup();

const hasFiles = computed(() => props.list.length > 0);
const hasFolders = computed(() => (props.folders?.length ?? 0) > 0);
const hasItems = computed(() => hasFiles.value || hasFolders.value);

const SignEncryption = defineAsyncComponent(() => import('@/components/biz/sign-encryption/src/index.vue'));
const isListStatus = computed(() => showStatus.value === 'list');
const isShowThread = computed(() => isListStatus.value && isSelectAll.value === false);

const filteredFiles = computed(() => {
  const target = props.keyword.toLowerCase();

  return props.list.filter(({ name }) => name.toLowerCase().includes(target));
});

const filteredFolders = computed(() => {
  if (!props.folders) return [];
  if (!props.keyword) return props.folders;

  const target = props.keyword.toLowerCase();

  return props.folders.filter(({ name }) => name.toLowerCase().includes(target));
});

/** 批次選取的 PDF ID 集合 */
const batchPdfIds = computed(() => {
  const ids = new Set<string>();

  for (const pdf of batch) {
    ids.add(pdf.PDFId);
  }

  return ids;
});

const hasSearchResults = computed(() => filteredFiles.value.length > 0 || filteredFolders.value.length > 0);

/** 批次選取的資料夾 ID 集合 */
const batchFolderIds = computed(() => {
  const ids = new Set<string>();

  for (const folder of folderBatch) {
    ids.add(folder.folderId);
  }

  return ids;
});

function changeShowStatus(status: FileShowStatus) {
  showStatus.value = status;
}

function openWarnPopup(file?: PDF) {
  toggleWarnPopup(true);

  if (!file) return;

  currentFile.value = file;
}

function closeWarnPopup() {
  toggleWarnPopup(false);
  currentFile.value = null;
}

function openEncryptPopup(file: PDF) {
  iShowEncryptPopup.value = true;
  currentFile.value = file;
}

function closeEncryptPopup() {
  iShowEncryptPopup.value = false;
  currentFile.value = null;
}

function deleteFile() {
  if (currentFile.value) {
    deleteTrash(currentFile.value.PDFId);
    selectFile(currentFile.value, false);
  } else {
    batchDeleteTrash(batch);
    clearBatch();
  }

  closeWarnPopup();
}

function selectFile(file: PDF, isSelected: boolean) {
  if (isSelected) {
    batch.add(file);
  } else {
    batch.delete(file);
  }

  updateSelectAll();
}

function onCheckboxChange() {
  if (!hasItems.value) {
    isSelectAll.value = false;
    showToast({ message: t('prompt.no_files_to_select'), type: 'warn' });
    return;
  }

  if (!isSelectAll.value) {
    batch.clear();
    folderBatch.clear();
    return;
  }

  props.list.forEach(file => batch.add(file));
  props.folders?.forEach(folder => folderBatch.add(folder));
}

function selectFolder(folder: Folder, isSelected: boolean) {
  if (isSelected) {
    folderBatch.add(folder);
  } else {
    folderBatch.delete(folder);
  }

  updateSelectAll();
}

function clearBatch() {
  batch.clear();
  folderBatch.clear();
  updateSelectAll();
}

async function updateSelectAll() {
  await nextTick();

  const totalSelected = batch.size + folderBatch.size;

  if (!totalSelected) {
    isSelectAll.value = false;
    return;
  }

  const totalItems = props.list.length + (props.folders?.length ?? 0);

  isSelectAll.value = totalSelected === totalItems ? true : 'mixed';
}

function openMoveModal() {
  singleMovePdfIds.value = batchPdfIds.value;
  movingFolderIds.value = batchFolderIds.value;
  isShowMoveModal.value = true;
}

function openSingleMoveModal(file: PDF) {
  singleMovePdfIds.value = new Set([file.PDFId]);
  movingFolderIds.value = new Set();
  isShowMoveModal.value = true;
}

function openFolderMoveModal(folder: Folder) {
  singleMovePdfIds.value = new Set();
  movingFolderIds.value = new Set([folder.folderId]);
  isShowMoveModal.value = true;
  clearBatch();
}

function closeMoveModal() {
  isShowMoveModal.value = false;
  clearBatch();
}

onActivated(updateSelectAll);
</script>

<template>
  <div class="sign-files">
    <div class="hidden w-full items-end px-4 py-5 lg:flex">
      <div class="flex h-6 w-75 items-center gap-5 pl-6">
        <div
          class="flex h-8 w-7 cursor-pointer items-center justify-center rounded transition-colors hover:bg-gray-50/15"
        >
          <checkbox
            v-model="isSelectAll"
            @change="onCheckboxChange"
          />
        </div>

        <batch-operation
          v-if="isSelectAll"
          :type
          :batch
          :folder-batch="folderBatch"
          @clear-batch="clearBatch"
          @open-warn-popup="openWarnPopup"
          @batch-move-to-folder="openMoveModal"
        />

        <p :class="['text-sm', { 'opacity-0': isSelectAll }]">
          {{ isShowThread ? $t('setup_time') : $t('batch_operation') }}
        </p>
      </div>

      <div class="flex flex-1 items-end justify-between">
        <p :class="['h-6 text-sm', { 'opacity-0': !isShowThread }]">
          {{ $t('project_name') }}
        </p>
        <div class="flex items-center gap-1">
          <!-- 新增資料夾按鈕（僅檔案頁籤） -->
          <svg-icon
            v-if="type === 'file'"
            name="folder_new"
            class="h-10 w-10"
            @click="emit('openCreateFolder')"
          />
          <svg-icon
            name="list"
            :class="['h-10 w-10', { 'text-primary': isListStatus }]"
            @click="changeShowStatus('list')"
          />
          <svg-icon
            name="card"
            :class="['h-10 w-10', { 'text-primary': showStatus === 'card' }]"
            @click="changeShowStatus('card')"
          />
        </div>
      </div>
    </div>

    <ul
      v-if="hasSearchResults"
      :class="[
        'min-h-0 w-full flex-1 gap-6 overflow-y-auto px-4',
        { 'lg:flex lg:flex-row lg:flex-wrap lg:gap-4': !isListStatus },
      ]"
    >
      <folder-row
        v-for="folder in filteredFolders"
        :key="folder.folderId"
        :folder
        :is-list-status
        :is-select-all
        @navigate="emit('navigateFolder', $event)"
        @open-rename-dialog="emit('openRenameDialog', $event)"
        @open-move-folder="openFolderMoveModal"
        @select-folder="selectFolder"
      />

      <sign-file
        v-for="(pdf, index) in filteredFiles"
        :key="pdf.PDFId"
        :file="pdf"
        :index
        :type
        :is-list-status
        :keyword
        :is-select-all
        @open-warn-popup="openWarnPopup"
        @open-encrypt-popup="openEncryptPopup"
        @select-file="selectFile"
        @open-move-to-folder="openSingleMoveModal"
      />
    </ul>

    <div
      v-else
      class="flex w-[80%] flex-1 flex-col items-center justify-center"
    >
      <img
        src="@/assets/img/img_search.svg"
        alt="Search Icon"
        class="mb-10"
      />
      <h3 class="text-gray-40 mb-3 text-center">
        {{ $t('prompt.un_found') }}
      </h3>
      <p class="text-gray-40 text-center">
        {{ $t('prompt.try_another') }}
      </p>
    </div>

    <popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">
        {{ $t('prompt.sure_delete_file') }}
      </p>
      <div class="flex justify-between lg:justify-evenly">
        <button
          class="btn btn-base"
          @click="closeWarnPopup"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn-primary"
          @click="deleteFile"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </popup>

    <sign-encryption
      v-if="iShowEncryptPopup"
      :file="currentFile"
      @close-encrypt-popup="closeEncryptPopup"
    />

    <move-folder-modal
      v-if="isShowMoveModal"
      :pdf-ids="singleMovePdfIds"
      :moving-folder-ids="movingFolderIds"
      @close="closeMoveModal"
    />
  </div>
</template>

<style lang="css" scoped>
.sign-files {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0%;
  min-height: 0;
}
</style>
