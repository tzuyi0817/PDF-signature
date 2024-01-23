<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePdfStore, useConfigStore } from '@/store';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignIcon from '@/components/SignIcon.vue';
import useFabric from '@/hooks/useFabric';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';
import { sleep } from '@/utils/common';
import { checkFile } from '@/utils/reader';

const isNextDisabled = ref(true);
const fileName = ref('');
const projectName = ref('');
const isShowPen = ref(true);
const { t, locale } = useI18n();
const { createCanvas, drawPDF, drawImage, pages, deleteCanvas } = useFabric('canvas');
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();
const { toggleLoading } = useConfigStore();

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

async function readerFile(files?: FileList | null) {
  try {
    const regexp = /.pdf|.png|.jpg|.jpeg/;
    const file = checkFile(files, regexp);

    if (!file) return;
    toggleLoading({ isShow: true, title: 'upload_file', content: 'file_uploading' });
    file.type === 'application/pdf' ? await drawPDF(file) : drawImage(file);
    await sleep();
    toast.showToast(t('prompt.file_upload_success'), 'success');
    fileName.value = file.name;
    projectName.value = file.name.replace(regexp, '');
    isNextDisabled.value = false;
  } catch {
    toast.showToast(t('prompt.file_upload_failed'), 'error');
  } finally {
    toggleLoading({ isShow: false });
  }
}

function remove() {
  fileName.value = '';
  usePdfStore().clearCurrentPDF();
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
onBeforeUnmount(deleteCanvas);
</script>

<template>
  <div class="upload_content content">
    <h5 class="title text-center">{{ $t('upload_file') }}</h5>
    <div
      v-show="fileName"
      class="upload_content_box pt-3 md:pt-12"
    >
      <div class="flex flex-col gap-2 items-center w-full h-fit">
        <div class="relative h-fit">
          <sign-icon
            name="close"
            class="absolute -right-8 -top-2 cursor-pointer w-7 h-7 md:w-9 md:h-9 md:-right-12 md:-top-4"
            @click="remove"
          />
          <canvas
            id="canvas"
            class="border-2 border-gray-20 w-full"
          >
          </canvas>
        </div>
        <h5 class="w-full text-ellipsis overflow-hidden whitespace-nowrap text-center">{{ fileName }}</h5>
        <p class="text-gray-40">{{ $t('page', pages) }}</p>
      </div>

      <div class="w-full flex flex-col gap-4 items-center">
        <p>{{ $t('project_name') }}</p>
        <label class="w-[90%] relative max-w-[400px]">
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
              'absolute right-1 top-[2px] w-9 h-9 transition-all pointer-events-none',
              isShowPen ? 'opacity-100' : 'opacity-0',
            ]"
          />
        </label>
      </div>
    </div>

    <div
      v-if="!fileName"
      class="upload_content_box border-dashed border-secondary border-[1px] justify-center"
      @dragover.stop.prevent
      @dragenter.stop.prevent
      @drop.stop.prevent="dropFile"
    >
      <img
        src="@/assets/img/img_photo.svg"
        alt="photo icon"
      />
      <button class="btn btn_primary">
        <input
          type="file"
          accept="application/pdf, .jpg, .png"
          class="opacity-0 absolute w-[131px] h-[41px] cursor-pointer"
          @change="uploadFile"
        />{{ $t('select_file') }}
      </button>

      <div class="text-center">
        <h5 class="text-gray-40 mb-3 hidden md:block">{{ $t('prompt.or_drag_file') }}</h5>
        <p class="text-gray-40 px-4 text-center">
          {{ $t('prompt.support_filetype', { type: locale === 'zh-TW' ? 'PDF、JPG、PNG' : 'PDF, JPG, and PNG' }) }}
        </p>
      </div>
    </div>

    <sign-step-btn
      :is-next-disabled="isNextDisabled"
      @next-step="goPage('signature')"
      @prev-step="toggleWarnPopup(true)"
    />
    <sign-popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">{{ $t('prompt.give_up_edit') }}</p>
      <div class="flex justify-between md:justify-around">
        <button
          class="btn btn_base"
          @click="toggleWarnPopup(false)"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn_primary"
          @click="giveUpUpload"
        >
          {{ $t('give_up') }}
        </button>
      </div>
    </sign-popup>
  </div>
</template>

<style lang="postcss" scoped>
.upload_content {
  &_box {
    @apply my-5
    px-[10px]
    rounded-[20px]
    flex
    flex-col
    items-center
    gap-7
    overflow-y-auto
    w-full
    h-[calc(100%-128px)];
  }
}
</style>
