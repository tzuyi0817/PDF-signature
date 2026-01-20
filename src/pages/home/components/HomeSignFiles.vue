<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onActivated, ref } from 'vue';
import { BatchOperation, Checkbox, SvgIcon } from '@/components/common';
import SignFile from '@/components/SignFile.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { usePdfStore } from '@/stores';
import HomeSearch from './HomeSearch.vue';
import type { FileShowStatus, MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  type: MenuTab;
  list: PDF[];
}

const { list } = defineProps<Props>();
const keyword = ref('');
const showStatus = ref<FileShowStatus>('list');
const iShowEncryptPopup = ref(false);
const isSelectAll = ref<boolean | 'mixed'>(false);
const currentFile = ref<PDF | null>(null);
const batch = new Set<PDF>();
const { deleteTrash, batchDeleteTrash } = usePdfStore();
const { isShowWarnPopup, Popup, toggleWarnPopup } = useWarnPopup();

const SignEncryption = defineAsyncComponent(() => import('@/components/SignEncryption.vue'));
const isListStatus = computed(() => showStatus.value === 'list');
const isShowThread = computed(() => isListStatus.value && isSelectAll.value === false);
const search = computed(() => {
  const target = keyword.value.toLowerCase();

  return list.filter(({ name }) => name.toLowerCase().includes(target));
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
  if (!isSelectAll.value) {
    batch.clear();
    return;
  }
  list.forEach(file => batch.add(file));
}

function clearBatch() {
  batch.clear();
  updateSelectAll();
}

async function updateSelectAll() {
  await nextTick();

  if (!batch.size) {
    isSelectAll.value = false;
    return;
  }
  isSelectAll.value = batch.size === list.length ? true : 'mixed';
}

onActivated(updateSelectAll);
</script>

<template>
  <div class="sign-files">
    <home-search v-model="keyword" />

    <div class="hidden w-full items-end px-4 py-5 md:flex">
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
          @clear-batch="clearBatch"
          @open-warn-popup="openWarnPopup"
        />

        <p :class="['text-sm', { 'opacity-0': isSelectAll }]">
          {{ isShowThread ? $t('setup_time') : $t('batch_operation') }}
        </p>
      </div>

      <div class="flex flex-1 items-end justify-between">
        <p :class="['h-6 text-sm', { 'opacity-0': !isShowThread }]">
          {{ $t('project_name') }}
        </p>
        <div class="flex gap-1">
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
      v-if="search.length"
      :class="[
        'h-[calc(100%-60px)] w-full gap-6 overflow-y-auto px-4',
        { 'md:flex md:flex-row md:flex-wrap md:gap-4': !isListStatus },
      ]"
    >
      <sign-file
        v-for="(pdf, index) in search"
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
      />
    </ul>

    <div
      v-else
      class="flex h-[calc(100%-60px)] w-[80%] flex-col items-center justify-center"
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
      <div class="flex justify-between md:justify-evenly">
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
  </div>
</template>

<style lang="css" scoped>
.sign-files {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
</style>
