<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignIcon from '@/components/SignIcon.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { useConfigStore, useImageStore } from '@/store';
import { convertToBase64 } from '@/utils/image';
import { checkFile } from '@/utils/reader';
import type { DragOffset } from '@/types/drag';
import type { SignatureTool } from '@/types/menu';
import SignaturePopup from './SignaturePopup.vue';

interface Emits {
  useImage: [src: string];
}

const emit = defineEmits<Emits>();
const currentTool = defineModel<SignatureTool | ''>('currentTool');
const dragOffset = defineModel<DragOffset>('dragOffset', { required: true });
const currentSelect = ref('');
const isShowImagePopup = ref(false);
const { imageList } = storeToRefs(useImageStore());
const { t, locale } = useI18n();
const { isShowWarnPopup, SignPopup, toggleWarnPopup } = useWarnPopup();
const { toggleLoading } = useConfigStore();

function useImage() {
  emit('useImage', currentSelect.value);
  close();
}

function selectImage(image: string) {
  currentSelect.value = image;
}

function deleteImage() {
  useImageStore().deleteImage(currentSelect.value);
  showToast(t('prompt.picture_delete_success'));
  toggleWarnPopup(false);
  currentSelect.value = '';
}

function toggleImagePopup(isOpen: boolean) {
  isShowImagePopup.value = isOpen;
}

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
    const file = checkFile(files, /.png|.jpg|.jpeg/);

    if (!file) return;
    toggleLoading({ isShow: true, title: 'upload_file', content: 'file_uploading' });
    const result = await convertToBase64(file);

    if (imageList.value.includes(result)) {
      showToast({ message: t('prompt.picture_already_exists'), type: 'error' });
      return;
    }
    useImageStore().addImage(result);
    toggleImagePopup(false);
    showToast(t('prompt.picture_add_success'));
  } catch {
    showToast({ message: t('prompt.picture_upload_failed'), type: 'error' });
  } finally {
    toggleLoading({ isShow: false });
  }
}

function dragImage(event: DragEvent) {
  const { src, offsetHeight, offsetWidth } = event.target as HTMLImageElement;
  const offsetX = event.offsetX / offsetWidth;
  const offsetY = event.offsetY / offsetHeight;

  event.dataTransfer?.setData('text/uri-list', src);
  event.dataTransfer?.setData('custom/offset', JSON.stringify({ offsetX, offsetY }));
  dragOffset.value = { x: event.offsetX, y: event.offsetY, width: offsetWidth, height: offsetHeight };
}

function close() {
  currentTool.value = '';
}
</script>

<template>
  <signature-popup
    :is-show-popup="currentTool === 'image'"
    :title="$t('picture_gallery')"
    :is-disabled="!currentSelect"
    @close="close"
    @use="useImage"
  >
    <ul
      v-if="imageList.length"
      class="signature-list"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt="add dark icon"
        width="60"
        height="60"
        class="iconScale mb-3"
        @click="toggleImagePopup(true)"
      />
      <li
        v-for="image in imageList"
        :key="image"
        :class="[
          'rounded-[20px] relative w-full flex justify-center cursor-pointer h-[180px]',
          currentSelect === image ? 'bg-primary opacity-70' : 'bg-white',
        ]"
        @click="selectImage(image)"
      >
        <img
          :src="image"
          alt="image"
          class="object-cover rounded-[20px]"
          @dragstart="dragImage"
        />
        <sign-icon
          v-show="currentSelect === image"
          name="close_s"
          class="absolute top-1 right-1 w-8 h-8 text-gray-80 drop-shadow-md"
          hover-color="hover:text-danger"
          @click="toggleWarnPopup(true)"
        />
      </li>
    </ul>

    <div
      v-else
      class="signature-list justify-center"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt="add dark icon"
        width="80"
        height="80"
        class="iconScale mb-5"
        @click="toggleImagePopup(true)"
      />
      <h5 class="text-secondary text-center">
        {{ $t('add_picture') }}
      </h5>
    </div>
  </signature-popup>

  <sign-popup
    v-if="isShowImagePopup"
    :title="$t('add_picture')"
  >
    <div
      class="signature-image-add"
      @dragover.stop.prevent
      @dragenter.stop.prevent
      @drop.stop.prevent="dropFile"
    >
      <img
        src="@/assets/img/img_photo.svg"
        alt=""
      />
      <button class="btn btn-primary">
        <input
          type="file"
          accept="application/.jpg, .png"
          class="opacity-0 absolute w-[131px] h-[41px] cursor-pointer"
          @change="uploadFile"
        />{{ $t('select_file') }}
      </button>

      <div class="text-center">
        <h5 class="text-gray-40 mb-3 hidden md:block">
          {{ $t('prompt.or_drag_file') }}
        </h5>
        <p class="text-gray-40 px-4 text-center">
          {{ $t('prompt.support_filetype', { type: locale === 'en-US' ? 'JPG and PNG' : 'JPG、PNG' }) }}
        </p>
      </div>
    </div>

    <button
      class="btn btn-base"
      @click="toggleImagePopup(false)"
    >
      {{ $t('cancel') }}
    </button>
  </sign-popup>

  <sign-popup
    v-if="isShowWarnPopup"
    :title="$t('warn')"
  >
    <p class="text-center">
      {{ $t('prompt.sure_delete_picture') }}
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
        @click="deleteImage"
      >
        {{ $t('delete') }}
      </button>
    </div>
  </sign-popup>
</template>

<style lang="css" scoped>
.signature-image-add {
  border: 1px dashed var(--color-secondary);
  padding: 20px 0;
  margin: 20px 0;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}
</style>
