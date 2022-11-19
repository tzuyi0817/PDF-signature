<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePdfStore } from '@/store';
import SignStepBtn from '@/components/SignStepBtn.vue';
import useFabric from '@/hooks/useFabric';
import toast from '@/utils/toast';
import useWarnPopup from '@/hooks/useWarnPopup';

const isNextDisabled = ref(true);
const fileName = ref('');
const projectName = ref('');
const isShowPen = ref(true);
const { createCanvas, drawPDF, drawImage, pages } = useFabric('canvas');
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();

async function uploadFile(event: Event) {
  const MAX_SIZE = 20 * 1024 * 1024;
  const target = event.target as HTMLInputElement;
  const { files } = target;
  if (!files) return;
  const file = files[0];

  if (file.size > MAX_SIZE) {
    target.value = '';
    return toast.showToast('檔案大小超過20MB', 'error');
  }

  try {
    file.type === 'application/pdf' ? await drawPDF(file) : drawImage(file);
    toast.showToast('檔案上傳成功', 'success');
    fileName.value = file.name;
    projectName.value = file.name.replace(/.pdf|.png|.jpg|.jpeg/, '');
    isNextDisabled.value = false;
  } catch {
    toast.showToast('檔案上傳失敗', 'error');
  }
  target.value = '';
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
    <div v-show="fileName" class="upload_content_box">
      <div class="relative flex flex-col gap-2 items-center">
        <img src="@/assets/icon/ic_close.svg" alt="" class="absolute -right-8 -top-8" @click="remove" />
        <canvas id="canvas" class="border-2 border-gray-20"></canvas>
        <h5>{{ fileName }}</h5>
        <p class="text-gray-40">{{ pages }}頁</p>
      </div>

      <div class="w-full flex flex-col gap-4 items-center">
        <p>專案名稱</p>
        <label class="w-[90%] relative">
          <input type="text" v-model.trim="projectName" class="input" @focus="focus" @blur="blur" />
          <img v-show="isShowPen" src="@/assets/icon/ic_edit.svg" alt="" class="absolute right-1 top-[2px]" />
        </label>
      </div>
    </div>

    <div v-if="!fileName" class="upload_content_box border-dashed border-secondary border-[1px]">
      <img src="@/assets/img/img_photo.svg" alt="" />
      <button class="btn btn_primary">
        <input
          type="file"
          accept="application/pdf, .jpg, .png"
          class="opacity-0 absolute w-[131px] h-[41px] cursor-pointer"
          @change="uploadFile"
        />選擇檔案
      </button>
      <p class="tracking-wider text-gray-40 px-4 text-center">僅支援 PDF、JPG、PNG 檔案 , 且容量不超過 20MB。</p>
    </div>

    <sign-step-btn :isNextDisabled="isNextDisabled" @nextStep="goPage('signature')" @prevStep="toggleWarnPopup(true)" />
    <sign-popup title="警告" v-if="isShowWarnPopup">
      <p class="text-center">確定要放棄編輯文件?</p>
      <div class="flex justify-between">
        <button class="btn btn_base" @click="toggleWarnPopup(false)">先不要</button>
        <button class="btn btn_primary" @click="goBack">放棄</button>
      </div>
    </sign-popup>
  </div>
</template>

<style lang="postcss" scoped>
.upload_content {
  &_box {
    @apply
    my-[20px]
    mx-[10px]
    rounded-[20px]
    pt-12
    flex
    flex-col
    justify-center
    items-center
    gap-7
    overflow-y-auto
    w-[calc(100%-20px)]
    h-[calc(100%-128px)];
  }
}
</style>