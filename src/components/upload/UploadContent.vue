<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePdfStore } from '@/store';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignIcon from '@/components/SignIcon.vue';
import useFabric from '@/hooks/useFabric';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';
import { sleep } from '@/utils/common';

const isNextDisabled = ref(true);
const fileName = ref('');
const projectName = ref('');
const isShowPen = ref(true);
const { createCanvas, drawPDF, drawImage, pages } = useFabric('canvas');
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();
const { isShowWarnPopup: isShowLoading, SignPopup: loadingPopup, toggleWarnPopup: toggleLoading } = useWarnPopup();

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
  const regexp = /.pdf|.png|.jpg|.jpeg/;

  if (!regexp.test(file.type)) {
    return toast.showToast('檔案格式不符', 'error');
  }

  if (file.size > MAX_SIZE) {
    return toast.showToast('檔案大小超過20MB', 'error');
  }

  try {
    isShowLoading.value = true;
    file.type === 'application/pdf' ? await drawPDF(file) : drawImage(file);
    await sleep();
    toast.showToast('檔案上傳成功', 'success');
    fileName.value = file.name;
    projectName.value = file.name.replace(regexp, '');
    isNextDisabled.value = false;
  } catch {
    toast.showToast('檔案上傳失敗', 'error');
  }
  isShowLoading.value = false;
}

function remove() {
  fileName.value = '';
  usePdfStore().setCurrentPDF({
    PDFId: '',
    name: '',
    updateDate: 0,
    PDFBase64: '',
    pages: 0,
  });
}

function focus() {
  isShowPen.value = false;
}

function blur() {
  isShowPen.value = true;
  usePdfStore().setCurrentPDFName(projectName.value);
}

onMounted(createCanvas);
</script>

<template>
  <div class="upload_content content">
    <h5 class="title text-center">上傳檔案</h5>
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
        <p class="text-gray-40">{{ pages }}頁</p>
      </div>

      <div class="w-full flex flex-col gap-4 items-center">
        <p>專案名稱</p>
        <label class="w-[90%] relative max-w-[400px]">
          <input
            type="text"
            v-model.trim="projectName"
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
        />選擇檔案
      </button>

      <div class="text-center">
        <h5 class="text-gray-40 mb-3 hidden md:block">或者將檔案拖曳到這裡</h5>
        <p class="text-gray-40 px-4 text-center">僅支援 PDF、JPG、PNG 檔案 , 且容量不超過 20MB。</p>
      </div>
    </div>

    <sign-step-btn
      :isNextDisabled="isNextDisabled"
      @nextStep="goPage('signature')"
      @prevStep="toggleWarnPopup(true)"
    />
    <sign-popup
      title="警告"
      v-if="isShowWarnPopup"
    >
      <p class="text-center">確定要放棄編輯文件?</p>
      <div class="flex justify-between md:justify-around">
        <button
          class="btn btn_base"
          @click="toggleWarnPopup(false)"
        >
          先不要
        </button>
        <button
          class="btn btn_primary"
          @click="goBack"
        >
          放棄
        </button>
      </div>
    </sign-popup>
    <loading-popup
      v-if="isShowLoading"
      title="上傳檔案"
    >
      <div class="flex flex-col gap-8 items-center py-8">
        <img
          src="@/assets/img/loading.gif"
          class="w-[60%]"
          alt="loading gif"
        />

        <h5 class="text-center text-gray-40">檔案上傳中...</h5>
      </div>
    </loading-popup>
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
