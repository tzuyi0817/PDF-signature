<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue';
import SignStepBtn from '@/components/SignStepBtn.vue';
import useFabric from '@/hooks/useFabric';
import toast from '@/utils/toast';

const isShowWarnPopup = ref(false);
const isNextDisabled = ref(true);
const fileNme = ref('');
const SignPopup = defineAsyncComponent(() => import('@/components/SignPopup.vue'));
const { createCanvas, drawPDF, drawImage } = useFabric('canvas');

function toggleWarnPopup(isOpen: boolean) {
  isShowWarnPopup.value = isOpen;
}

function nextStep() {
  console.log('nextStep');
}

async function uploadFile(event: Event) {
  const MAX_SIZE = 20 * 1024 * 1024;
  const { files } = event.target as HTMLInputElement;
  if (!files) return;
  const file = files[0];
  console.log({ file })
  if (file.size > MAX_SIZE) {
    toast.showToast('檔案大小超過20MB', 'error');
    return;
  }
  file.type === 'application/pdf' ? await drawPDF(file) : drawImage(file);
  toast.showToast('檔案上傳成功', 'success');
  fileNme.value = file.name;
}

onMounted(createCanvas);
</script>

<template>
  <div class="upload_content content">
    <h5 class="title text-center">上傳檔案</h5>

    <div v-show="fileNme" class="upload_content_box">
      <canvas id="canvas" class="border-2 border-gray-20"></canvas>
    </div>

    <div v-if="!fileNme" class="upload_content_box border-dashed border-secondary border-[1px]">
      <img src="@/assets/img/img_photo.svg" alt="">
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

    <sign-step-btn :isNextDisabled="isNextDisabled" @nextStep="nextStep" @prevStep="toggleWarnPopup(true)" />
    <sign-popup title="警告" v-if="isShowWarnPopup">
      <p class="text-center">確定要放棄編輯文件?</p>
      <div class="flex justify-between">
        <button class="btn btn_base" @click="toggleWarnPopup(false)">先不要</button>
        <button class="btn btn_primary">放棄</button>
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
    flex
    flex-col
    justify-center
    items-center
    gap-7
    w-[calc(100%-20px)]
    h-[calc(100%-128px)];
  }
  &_footer {
    @apply flex justify-between;
  }
}
</style>