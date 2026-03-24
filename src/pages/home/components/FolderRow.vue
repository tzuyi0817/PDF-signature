<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Popup, showToast, SvgIcon } from '@/components/common';
import { useFolderStore, usePdfStore } from '@/stores';
import { transformTimestamp } from '@/utils/common';
import type { Folder } from '@/types/folder';

interface Props {
  folder: Folder;
  isListStatus: boolean;
  isSelectAll: boolean | 'mixed';
}

interface Emits {
  navigate: [folderId: string];
  openRenameDialog: [folder: Folder];
  openMoveFolder: [folder: Folder];
  selectFolder: [folder: Folder, isSelected: boolean];
}

const { folder, isSelectAll } = defineProps<Props>();
const emit = defineEmits<Emits>();
const isSelected = ref(false);
const isShowMore = ref(false);
const isShowDeleteConfirm = ref(false);
const { t } = useI18n();

const localTime = computed(() => transformTimestamp(folder.createDate));

function openFolder() {
  if (isSelectAll) {
    toggleSelect();
    return;
  }

  emit('navigate', folder.folderId);
}

function toggleSelect() {
  isSelected.value = !isSelected.value;
  emit('selectFolder', folder, isSelected.value);
}

watch(
  () => isSelectAll,
  isSelect => {
    if (isSelect === 'mixed') return;

    isSelected.value = isSelect;
  },
);

function renameFolder() {
  toggleMore(false);
  emit('openRenameDialog', folder);
}

function moveFolder() {
  toggleMore(false);
  emit('openMoveFolder', folder);
}

function openDeleteConfirm() {
  toggleMore(false);
  isShowDeleteConfirm.value = true;
}

function closeDeleteConfirm() {
  isShowDeleteConfirm.value = false;
}

function confirmDelete() {
  isShowDeleteConfirm.value = false;

  const folderStore = useFolderStore();
  const { orphanFilesToRoot } = usePdfStore();
  const { deletedIds, promise } = folderStore.deleteFolder(folder.folderId);

  orphanFilesToRoot(deletedIds);

  promise.then(() => {
    showToast(t('folder.deleted'));
  });
}

function toggleMore(isOpen: boolean) {
  isShowMore.value = isOpen;
}
</script>

<template>
  <li
    :class="[
      'folder-row flex flex-col',
      isListStatus ? 'lg:flex-row' : 'lg:h-fit lg:w-79 lg:shrink-0',
      { active: isSelected },
    ]"
    @click="openFolder"
  >
    <div :class="['transition-opacity lg:hidden', isShowMore ? 'z-10 opacity-100' : '-z-1 opacity-0']">
      <template v-if="isShowMore">
        <div
          class="mask"
          @click.stop="toggleMore(false)"
        ></div>

        <ul class="folder-row-more dark:bg-gray-80 bg-white">
          <li>
            <svg-icon
              name="edit"
              class="h-10 w-10"
              @click.stop="renameFolder"
            />
          </li>
          <li>
            <svg-icon
              name="folder_move"
              class="h-10 w-10"
              @click.stop="moveFolder"
            />
          </li>
          <li>
            <svg-icon
              name="trash"
              class="h-10 w-10"
              @click.stop="openDeleteConfirm"
            />
          </li>
        </ul>
      </template>
    </div>

    <svg-icon
      name="more"
      :class="`absolute top-1 right-2 h-10 w-10 ${isShowMore ? 'opacity-0' : 'opacity-100'} lg:hidden`"
      @click.stop="toggleMore(true)"
    />

    <div :class="['flex h-37.5 w-1/3 items-center justify-center', { 'lg:hidden': isListStatus }]">
      <svg-icon
        name="folder"
        class="text-primary h-20 w-20"
      />
    </div>

    <div
      :class="[
        'folder-row-content mt-4 flex-col text-center',
        { 'lg:mt-0 lg:w-full lg:flex-row lg:items-center lg:text-start': isListStatus },
      ]"
    >
      <div :class="{ 'lg:flex lg:flex-1 lg:flex-row-reverse lg:items-center lg:gap-1': isListStatus }">
        <p class="flex-1 font-medium">{{ folder.name }}</p>

        <p :class="['text-gray-40', { 'lg:hidden': isListStatus }]">
          {{ localTime }}
        </p>

        <svg-icon
          v-if="isListStatus"
          name="folder"
          class="text-primary mr-2 hidden h-10 w-10 lg:inline-flex"
        />
      </div>

      <ul :class="['hidden flex-row justify-center gap-1 lg:flex', { 'mt-4': !isListStatus }]">
        <li>
          <svg-icon
            name="edit"
            class="h-10 w-10"
            @click.stop="renameFolder"
          />
        </li>
        <li>
          <svg-icon
            name="folder_move"
            class="h-10 w-10"
            @click.stop="moveFolder"
          />
        </li>
        <li>
          <svg-icon
            name="trash"
            class="h-10 w-10"
            @click.stop="openDeleteConfirm"
          />
        </li>
      </ul>
    </div>
  </li>

  <popup
    v-if="isShowDeleteConfirm"
    :title="t('warn')"
    @close-popup="closeDeleteConfirm"
  >
    <p class="text-center">
      {{ t('folder.confirm_delete') }}
    </p>
    <div class="flex justify-between lg:justify-evenly">
      <button
        class="btn btn-base"
        @click="closeDeleteConfirm"
      >
        {{ t('not_yet') }}
      </button>
      <button
        class="btn btn-primary"
        @click="confirmDelete"
      >
        {{ t('confirm') }}
      </button>
    </div>
  </popup>
</template>

<style lang="css" scoped>
.folder-row {
  position: relative;
  background-color: var(--color-card-bg);
  border: 2px solid var(--color-card-border);
  padding: 16px;
  border-radius: 20px;
  box-shadow:
    0px 2px 6px rgba(0, 0, 0, 0.12),
    0px 2px 10px rgba(0, 0, 0, 0.08),
    inset 0px -2px 4px rgba(215, 215, 215, 0.5);
  margin-bottom: 24px;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.folder-row.active {
  border-color: var(--color-primary);
  background: var(--color-card-hover);
}

@media (min-width: 1024px) {
  .folder-row:hover {
    background: var(--color-card-hover);
  }
}

.folder-row-more {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 1px 3px 0 var(--color-primary);
  border-radius: 20px;
}

.folder-row-content {
  display: flex;
  gap: 4px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
