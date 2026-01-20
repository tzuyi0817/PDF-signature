<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, defineAsyncComponent, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BlobImage, showToast, SvgIcon, Version } from '@/components/common';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { useConfigStore, usePdfStore } from '@/stores';

type WarnType = 'archive' | 'trash';

const warnType = ref<WarnType>('archive');
const iShowEncryptPopup = ref(false);
const { currentPDF } = storeToRefs(usePdfStore());
const { t } = useI18n();
const { isShowWarnPopup, Popup, goPage, toggleWarnPopup } = useWarnPopup();
const SignEncryption = defineAsyncComponent(() => import('@/components/biz/sign-encryption/src/index.vue'));
const warnContent = computed(() => {
  const contentMap = {
    archive: 'prompt.sure_archive_file',
    trash: 'prompt.sure_delete_file',
  };
  return contentMap[warnType.value];
});

function openWarnPopup(type: WarnType) {
  warnType.value = type;
  toggleWarnPopup(true);
}

function warnConfirm() {
  const { addArchive, addTrash } = usePdfStore();
  const isArchive = warnType.value === 'archive';

  if (isArchive) {
    addArchive(currentPDF.value);
  } else {
    addTrash(currentPDF.value);
  }
  showToast(t(isArchive ? 'prompt.file_archived_success' : 'prompt.file_delete_success'));
  toggleWarnPopup(false);

  if (isArchive) return;
  goPage('home');
}

function toggleEncryptPopup(isShow: boolean) {
  iShowEncryptPopup.value = isShow;
}

onBeforeMount(() => useConfigStore().updateFilePassword(''));
onBeforeUnmount(() => {
  usePdfStore().clearCurrentPDF();
});
</script>

<template>
  <div class="complete-content content">
    <h5 class="title w-full text-center">
      {{ $t('sign_completed') }}
    </h5>

    <ul class="toolbar md:absolute md:top-5 md:right-10">
      <li>
        <svg-icon
          name="download"
          class="h-9 w-9"
          @click="toggleEncryptPopup(true)"
        />
      </li>
      <li>
        <svg-icon
          name="archive"
          class="h-9 w-9"
          @click="openWarnPopup('archive')"
        />
      </li>
      <li>
        <svg-icon
          name="trash"
          class="h-9 w-9"
          @click="openWarnPopup('trash')"
        />
      </li>
    </ul>

    <div class="complete-content-file">
      <div class="flex h-fit w-fit origin-top-left scale-150 flex-col gap-5 px-3 py-5 md:scale-100 md:px-14 md:py-10">
        <template
          v-for="(canvas, index) in currentPDF.canvas"
          :key="index"
        >
          <blob-image
            :blob="canvas"
            alt="PDF document"
          />
        </template>
      </div>
    </div>

    <button
      class="btn btn-primary md:absolute md:top-7 md:left-10"
      :disabled="false"
      @click="goPage('home')"
    >
      <span class="text-4xl font-thin">←</span>{{ $t('return_home') }}
    </button>

    <version />

    <popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">
        {{ $t(warnContent) }}
      </p>
      <div class="flex justify-between md:justify-evenly">
        <button
          class="btn btn-base"
          @click="toggleWarnPopup(false)"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn-primary"
          @click="warnConfirm"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </popup>

    <sign-encryption
      v-if="iShowEncryptPopup"
      :file="currentPDF"
      @close-encrypt-popup="toggleEncryptPopup(false)"
    />
  </div>
</template>

<style lang="css" scoped>
.complete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.complete-content-file {
  margin-bottom: 20px;
  background-color: var(--color-gray-30);
  border: 2px solid var(--color-gray-30);
  overflow: auto;
  width: calc(100% - 20px);
  height: calc(100% - 178px);
  max-width: 842px;
}

@media (min-width: 768px) {
  .complete-content-file {
    margin-top: 24px;
    height: calc(100% - 110px);
  }
}
</style>
