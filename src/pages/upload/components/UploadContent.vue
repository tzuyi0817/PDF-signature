<script setup lang="ts">
import { useFabric } from '@component-hook/pdf-canvas/vue';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignIcon from '@/components/SignIcon.vue';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignVersion from '@/components/SignVersion.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { onAfterRouteLeave } from '@/router';
import { useConfigStore, usePdfStore } from '@/stores';
import { sleep } from '@/utils/common';
import { checkFile } from '@/utils/reader';

const fileName = ref('');
const projectName = ref('');
const isShowPen = ref(true);
const isShowPasswordPopup = ref(false);
const pages = ref(1);
const { t, locale } = useI18n();
const { createCanvas, deleteCanvas, loadFile } = useFabric({ id: 'canvas' });
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();
const { toggleLoading, updateFilePassword } = useConfigStore();
const UploadPassword = defineAsyncComponent(() => import('./UploadPassword.vue'));
const regexp = /.pdf|.png|.jpg|.jpeg/;
let currentFile: File | null = null;

const isNextDisabled = computed(() => !fileName.value);

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const { files } = target;

  await readerFile(files);
  target.value = '';
}

function dropFile(event: DragEvent) {
  const { dataTransfer } = event;
  const files = dataTransfer?.files;

  readerFile(files);
}

function readerFile(files?: FileList | null) {
  const file = checkFile(files, regexp);

  if (!file) return;
  currentFile = file;
  return renderFile(file);
}

async function renderFile(file: File) {
  try {
    const { setCurrentPDF } = usePdfStore();
    const { filePassword } = useConfigStore();

    toggleLoading({ isShow: true, title: 'upload_file', content: 'file_uploading' });
    await sleep();
    const fileContent = await loadFile(file, filePassword);

    if (!fileContent) throw new Error('File content is empty');
    setCurrentPDF(fileContent);
    pages.value = fileContent.pages;
    showToast(t('prompt.file_upload_success'));
    fileName.value = file.name;
    projectName.value = file.name.replace(regexp, '');
  } catch (error) {
    if (`${error}`.includes('PasswordException')) {
      isShowPasswordPopup.value = true;
      if (`${error}` !== 'PasswordException: Incorrect Password') return;
      showToast({ message: t('prompt.incorrect_password'), type: 'error' });
      updateFilePassword('');
      return;
    }
    showToast({ message: t('prompt.file_upload_failed'), type: 'error' });
  } finally {
    toggleLoading({ isShow: false });
  }
}

function closePasswordPopup(isEnterPassword = false) {
  isShowPasswordPopup.value = false;
  if (!isEnterPassword || !currentFile) return;
  renderFile(currentFile);
}

function remove() {
  fileName.value = '';
  usePdfStore().clearCurrentPDF();
  updateFilePassword('');
}

function giveUpUpload() {
  remove();
  goBack();
}

function focus() {
  isShowPen.value = false;
}

function blur() {
  isShowPen.value = true;
  usePdfStore().setCurrentPDFName(projectName.value);
}

onMounted(createCanvas);
onAfterRouteLeave(deleteCanvas);
</script>

<template>
  <div class="upload-content content">
    <h5 class="title text-center">
      {{ $t('upload_file') }}
    </h5>
    <div
      v-show="fileName"
      class="upload-content-box my-5 h-[calc(100%-128px)] w-full"
    >
      <div class="flex h-fit w-full flex-col items-center gap-2">
        <div class="relative h-fit">
          <sign-icon
            name="close"
            class="absolute -top-2 -right-8 h-7 w-7 cursor-pointer md:-top-4 md:-right-12 md:h-9 md:w-9"
            @click="remove"
          />
          <canvas
            id="canvas"
            class="border-gray-20 w-full border-2"
          >
          </canvas>
        </div>
        <h5 class="w-full overflow-hidden text-center text-ellipsis whitespace-nowrap">
          {{ fileName }}
        </h5>
        <p class="text-gray-40">
          {{ $t('page', pages) }}
        </p>
      </div>

      <div class="flex w-full flex-col items-center gap-4">
        <p>{{ $t('project_name') }}</p>
        <label class="relative w-[90%] max-w-[400px]">
          <input
            v-model.trim="projectName"
            type="text"
            class="input"
            @focus="focus"
            @blur="blur"
          />
          <img
            src="@/assets/icon/ic_edit.svg"
            alt="edit icon"
            :class="[
              'pointer-events-none absolute top-[2px] right-1 h-9 w-9 transition-all',
              isShowPen ? 'opacity-100' : 'opacity-0',
            ]"
          />
        </label>
      </div>
    </div>

    <div
      v-if="!fileName"
      class="border-secondary my-5 h-[calc(100%-128px)] w-full rounded-[20px] border border-dashed p-3"
    >
      <div
        class="upload-content-box h-full w-full justify-center"
        @dragover.stop.prevent
        @dragenter.stop.prevent
        @drop.stop.prevent="dropFile"
      >
        <img
          src="@/assets/img/img_photo.svg"
          alt="photo icon"
        />
        <button class="btn btn-primary">
          <input
            type="file"
            accept="application/pdf, .jpg, .png"
            class="absolute h-[41px] w-[131px] cursor-pointer opacity-0"
            @change="uploadFile"
          />{{ $t('select_file') }}
        </button>

        <div class="text-center">
          <h5 class="text-gray-40 mb-3 hidden md:block">
            {{ $t('prompt.or_drag_file') }}
          </h5>
          <p class="text-gray-40 px-4 text-center">
            {{ $t('prompt.support_filetype', { type: locale === 'en-US' ? 'PDF, JPG, and PNG' : 'PDF、JPG、PNG' }) }}
          </p>
        </div>
      </div>
    </div>

    <sign-step-btn
      :is-next-disabled="isNextDisabled"
      @next-step="goPage('signature')"
      @prev-step="toggleWarnPopup(true)"
    />
    <sign-version />
    <sign-popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">
        {{ $t('prompt.give_up_edit') }}
      </p>
      <div class="flex justify-between md:justify-around">
        <button
          class="btn btn-base"
          @click="toggleWarnPopup(false)"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn-primary"
          @click="giveUpUpload"
        >
          {{ $t('give_up') }}
        </button>
      </div>
    </sign-popup>

    <upload-password
      v-if="isShowPasswordPopup"
      @close-password="closePasswordPopup"
    />
  </div>
</template>

<style lang="css" scoped>
.upload-content-box {
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .upload-content-box {
    padding: 48px 10px;
  }
}
</style>
