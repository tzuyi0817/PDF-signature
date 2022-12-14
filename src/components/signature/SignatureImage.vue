<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useImageStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignIcon from '@/components/SignIcon.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';

interface Props {
  isShowImage: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:isShowImage', 'useImage']);
const currentSelect = ref('');
const isShowImagePopup = ref(false);
const { imageList } = storeToRefs(useImageStore());
const { isShowWarnPopup, SignPopup, toggleWarnPopup } = useWarnPopup();

function useImage() {
  emit('useImage', currentSelect.value);
  close();
}

function selectImage(image: string) {
  currentSelect.value = image;
}

function deleteImage() {
  useImageStore().deleteImage(currentSelect.value);
  toast.showToast('圖片刪除成功', 'success');
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

async function readerFile(files: FileList | null | undefined) {
  if (!files) return;
  const MAX_SIZE = 20 * 1024 * 1024;
  const file = files[0];
  const regexp = /.png|.jpg|.jpeg/;

  if (!regexp.test(file.type)) {
    return toast.showToast('檔案格式不符', 'error');
  }

  if (file.size > MAX_SIZE) {
    return toast.showToast('檔案大小超過20MB', 'error');
  }

  try {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      if (!fileReader.result) return;
      useImageStore().addImage(fileReader.result as string);
      toggleImagePopup(false);
      toast.showToast('圖片新增成功', 'success');
    }
  } catch {
    toast.showToast('圖片上傳失敗', 'error');
  }
}

function close() {
  emit('update:isShowImage', false);
}
</script>

<template>
  <signature-popup
    :isShowPopup="isShowImage" 
    title="圖片庫"
    :isDisabled="!currentSelect"
    @close="close"
    @use="useImage"
  >
    <ul v-if="imageList.length" class="signature_image_content">
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="60"
        height="60"
        class="iconScale mb-3"
        @click="toggleImagePopup(true)"
      />
      <li
        v-for="image in imageList"
        :key="image"
        @click="selectImage(image)"
        :class="[
          'rounded-[20px] relative w-full flex justify-center cursor-pointer',
          currentSelect === image ? 'bg-primary opacity-70' : 'bg-white',
        ]" 
      >
        <img :src="image" alt="" class="object-contain rounded-[20px]" />
        <sign-icon
          v-show="currentSelect === image"
          icon="close_s" 
          @click="toggleWarnPopup(true)"
          class="absolute top-1 left-1"
        />
      </li>
    </ul>

    <div v-else class="signature_image_content justify-center">
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="80"
        height="80"
        class="iconScale mb-5"
        @click="toggleImagePopup(true)"
      />
      <h5 class="text-secondary">新增圖片</h5>
    </div>
  </signature-popup>

  <sign-popup title="新增圖片" v-if="isShowImagePopup">
    <div
      class="signature_image_add"
      @dragover.stop.prevent
      @dragenter.stop.prevent
      @drop.stop.prevent="dropFile"
    >
      <img src="@/assets/img/img_photo.svg" alt="" />
      <button class="btn btn_primary">
        <input
          type="file"
          accept="application/.jpg, .png"
          class="opacity-0 absolute w-[131px] h-[41px] cursor-pointer"
          @change="uploadFile"
        />選擇檔案
      </button>

      <div class="text-center">
        <h5 class="text-gray-40 mb-3 hidden md:block">或者將檔案拖曳到這裡</h5>
        <p class="text-gray-40 px-4 text-center">僅支援 JPG、PNG 檔案 , 且容量不超過 20MB。</p>
      </div>
    </div>

    <button class="btn btn_base" @click="toggleImagePopup(false)">取消</button>
  </sign-popup>

  <sign-popup title="警告" v-if="isShowWarnPopup">
    <p class="text-center">確定要刪除此圖片?</p>
    <div class="flex justify-between md:justify-evenly">
      <button class="btn btn_base" @click="toggleWarnPopup(false)">先不要</button>
      <button class="btn btn_primary" @click="deleteImage">刪除</button>
    </div>
  </sign-popup>
</template>

<style lang="postcss" scoped>
.signature_image {
  &_content {
    @apply
    h-full
    overflow-y-auto
    flex
    flex-col
    px-4
    py-5
    gap-2
    items-center;
  }
  &_add {
    @apply
    border-dashed
    border-secondary
    border-[1px]
    py-5
    my-5
    rounded-[20px]
    flex
    flex-col
    justify-center
    gap-6
    items-center;
  }
}
</style>