<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import SignIcon from '@/components/SignIcon.vue';
import SignFile from '@/components/SignFile.vue';
import { usePdfStore } from '@/store';
import { useWarnPopup } from '@/hooks/useWarnPopup';
import type { MenuTab, FileShowStatus } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  type: MenuTab;
  list: PDF[];
}

const props = defineProps<Props>();
const keyword = ref('');
const showStatus = ref<FileShowStatus>('list');
const searchIconColor = ref('#CCCCCC');
const iShowEncryptPopup = ref(false);
const currentFile = ref<PDF | null>(null);
const { deleteTrash } = usePdfStore();
const { isShowWarnPopup, SignPopup, toggleWarnPopup } = useWarnPopup();
const SignEncryption = defineAsyncComponent(() => import('@/components/SignEncryption.vue'));
const isShowClose = computed(() => keyword.value);
const isListStatus = computed(() => showStatus.value === 'list');
const search = computed(() => {
  const target = keyword.value.toLowerCase();
  return props.list.filter(({ name }) => name.toLowerCase().includes(target));
});

function focus() {
  searchIconColor.value = '#B7EC5D';
}

function blur() {
  searchIconColor.value = '#CCCCCC';
}

function clear() {
  keyword.value = '';
}

function changeShowStatus(status: FileShowStatus) {
  showStatus.value = status;
}

function openWarnPopup(file: PDF) {
  toggleWarnPopup(true);
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
  deleteTrash(currentFile.value?.PDFId);
  closeWarnPopup();
}
</script>

<template>
  <div class="sign_files">
    <label class="w-[90%] relative m-3 max-w-[400px] md:absolute md:-top-16">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="absolute left-1 top-0 transition-colors"
        title="search icon"
      >
        <circle
          cx="19"
          cy="19"
          r="8.75"
          :stroke="searchIconColor"
          stroke-width="2.5"
        />
        <path
          d="M25 26L30 31"
          :stroke="searchIconColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>
      <sign-icon
        v-show="isShowClose"
        name="close_s"
        class="absolute right-1 top-0 w-10 h-10"
        @click="clear"
      />
      <input
        v-model.trim="keyword"
        type="text"
        class="input pl-12"
        :placeholder="$t('placeholder.keyword')"
        @focus="focus"
        @blur="blur"
      />
    </label>

    <div class="hidden md:flex items-end w-full px-4 py-5">
      <p class="text-sm w-[300px] pl-16">
        {{ isListStatus ? $t('setup_time') : '' }}
      </p>

      <div class="flex justify-between items-end flex-1">
        <p class="text-sm">
          {{ isListStatus ? $t('project_name') : '' }}
        </p>
        <div class="flex gap-1">
          <sign-icon
            name="list"
            :class="['w-10 h-10', { 'text-primary': showStatus === 'list' }]"
            @click="changeShowStatus('list')"
          />
          <sign-icon
            name="card"
            :class="['w-10 h-10', { 'text-primary': showStatus === 'card' }]"
            @click="changeShowStatus('card')"
          />
        </div>
      </div>
    </div>

    <ul
      v-if="search.length"
      :class="[
        'w-full h-[calc(100%-60px)] overflow-y-auto gap-6 px-4',
        { 'md:flex md:flex-row md:flex-wrap md:gap-4': !isListStatus },
      ]"
    >
      <sign-file
        v-for="(pdf, index) in search"
        :key="pdf.PDFId"
        :file="pdf"
        :index="index"
        :type="type"
        :is-list-status="isListStatus"
        :keyword="keyword"
        @open-warn-popup="openWarnPopup"
        @open-encrypt-popup="openEncryptPopup"
      />
    </ul>

    <div
      v-else
      class="w-[80%] h-[calc(100%-60px)] flex flex-col items-center justify-center"
    >
      <img
        src="@/assets/img/img_search.svg"
        alt="search icon"
        class="mb-10"
      />
      <h3 class="text-gray-40 text-center mb-3">
        {{ $t('prompt.un_found') }}
      </h3>
      <p class="text-gray-40 text-center">
        {{ $t('prompt.try_another') }}
      </p>
    </div>

    <sign-popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">
        {{ $t('prompt.sure_delete_file') }}
      </p>
      <div class="flex justify-between md:justify-evenly">
        <button
          class="btn btn_base"
          @click="closeWarnPopup"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn_primary"
          @click="deleteFile"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </sign-popup>

    <sign-encryption
      v-if="iShowEncryptPopup"
      :file="currentFile"
      @close-encrypt-popup="closeEncryptPopup"
    />
  </div>
</template>

<style lang="postcss" scoped>
.sign_files {
  @apply w-full flex flex-col items-center h-full relative justify-center;
}
</style>
