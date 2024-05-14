<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePdfStore } from '@/store';
import SignIcon from '@/components/SignIcon.vue';
import SignVersion from '@/components/SignVersion.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';

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

  isArchive ? addArchive(currentPDF.value) : addTrash(currentPDF.value);
  toast.showToast(t(isArchive ? 'prompt.file_archived_success' : 'prompt.file_delete_success'), 'success');
  toggleWarnPopup(false);
  !isArchive && goPage('index');
}

function toggleEncryptPopup(isShow: boolean) {
  iShowEncryptPopup.value = isShow;
}

onBeforeUnmount(() => {
  usePdfStore().clearCurrentPDF();
});
</script>

<template>
  <div class="complete_content content">
    <h5 class="title text-center w-full">{{ $t('sign_completed') }}</h5>

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

    <div class="complete_content_file">
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
      class="btn btn_primary md:absolute md:left-10 md:top-7"
      :disabled="false"
      @click="goPage('index')"
    >
      <span class="text-4xl font-thin">←</span>{{ $t('return_home') }}
    </button>

    <sign-version />
    <sign-popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">{{ $t(warnContent) }}</p>
      <div class="flex justify-between md:justify-evenly">
        <button
          class="btn btn_base"
          @click="toggleWarnPopup(false)"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn_primary"
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

<style lang="postcss" scoped>
.complete_content {
  @apply flex
  flex-col
  relative
  items-center;
  &_file {
    @apply mb-5
    bg-gray-30
    border-2
    border-gray-30
    overflow-auto
    w-[calc(100%-20px)]
    h-[calc(100%-178px)]
    max-w-[842px]
    md:mt-6
    md:h-[calc(100%-110px)];
  }
}
</style>
