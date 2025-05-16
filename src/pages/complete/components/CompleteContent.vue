<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, defineAsyncComponent, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignIcon from '@/components/SignIcon.vue';
import SignVersion from '@/components/SignVersion.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { useConfigStore, usePdfStore } from '@/stores';

type WarnType = 'archive' | 'trash';

const warnType = ref<WarnType>('archive');
const iShowEncryptPopup = ref(false);
const { currentPDF } = storeToRefs(usePdfStore());
const { t } = useI18n();
const { isShowWarnPopup, SignPopup, goPage, toggleWarnPopup } = useWarnPopup();
const SignEncryption = defineAsyncComponent(() => import('@/components/SignEncryption.vue'));
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
    <h5 class="title text-center w-full">
      {{ $t('sign_completed') }}
    </h5>

    <ul class="toolbar md:absolute md:right-10 md:top-5">
      <li>
        <sign-icon
          name="download"
          class="w-9 h-9"
          @click="toggleEncryptPopup(true)"
        />
      </li>
      <li>
        <sign-icon
          name="archive"
          class="w-9 h-9"
          @click="openWarnPopup('archive')"
        />
      </li>
      <li>
        <sign-icon
          name="trash"
          class="w-9 h-9"
          @click="openWarnPopup('trash')"
        />
      </li>
    </ul>

    <div class="complete-content-file">
      <div class="w-fit h-fit py-5 px-3 scale-150 origin-top-left flex flex-col gap-5 md:scale-100 md:py-10 md:px-14">
        <template
          v-for="canvas in currentPDF.canvas"
          :key="canvas"
        >
          <img
            :src="canvas"
            alt="PDF document"
          />
        </template>
      </div>
    </div>

    <button
      class="btn btn-primary md:absolute md:left-10 md:top-7"
      :disabled="false"
      @click="goPage('home')"
    >
      <span class="text-4xl font-thin">←</span>{{ $t('return_home') }}
    </button>

    <sign-version />
    <sign-popup
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
    </sign-popup>

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
