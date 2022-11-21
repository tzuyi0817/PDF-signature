<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignIcon from '@/components/SignIcon.vue';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignatureSign from '@/components/signature/SignatureSign.vue';
import SignatureImage from '@/components/signature/SignatureImage.vue';
import SignatureLiteral from '@/components/signature/SignatureLiteral.vue';
import SignatureCanvasItem from '@/components/signature/SignatureCanvasItem.vue';
import SignaturePage from '@/components/signature/SignaturePage.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';
import { sleep, isDesktop } from '@/utils/common';

const isShowSign = ref(false);
const isShowImage = ref(false);
const isShowLiteral = ref(false);
const isShowPage = ref(false);
const currentPage = ref(1);
const isShowNextWarnPopup = ref(false);
const isShowMergePopup = ref(false);
const isMergeComplete = ref(false);
const signatureCanvasItem = ref<InstanceType<typeof SignatureCanvasItem> | null>(null);
const { currentPDF } = storeToRefs(usePdfStore());
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();

async function mergeFile() {
  toggleNextWarnPopup(false);
  toggleMergePopup(true);

  try {
    if (!signatureCanvasItem.value) return;
    const { setCurrentPDFCanvas, addPDF } = usePdfStore();
    // @ts-ignore
    const canvas = signatureCanvasItem.value.map(({ canvasDom }) => {
      return canvasDom.toDataURL('image/png', 1.0);
    });
 
    setCurrentPDFCanvas(canvas);
    addPDF({ ...currentPDF.value, updateDate: Date.now() });
    await sleep(2000);
    toggleMergePopup(false);
    toast.showToast('檔案建立成功', 'success');

    goPage('complete');
  } catch {
    toast.showToast('操作逾時, 請重新操作', 'error');
    toggleMergePopup(false);
  }
}

function addFabric(value: string, type?: string) {
  if (!signatureCanvasItem.value) return;
  // @ts-ignore
  const proxy = signatureCanvasItem.value.at(currentPage.value - 1);

  type === 'text'
    ? proxy.addTextFabric(value)
    : proxy.addFabric(value);
}

function showSign() {
  closeAllPopup();
  isShowSign.value = true;
}

function showImage() {
  closeAllPopup();
  isShowImage.value = true;
}

function showLiteral() {
  closeAllPopup();
  isShowLiteral.value = true;
}

function showPage() {
  closeAllPopup();
  isShowPage.value = true;
}

function closeAllPopup() {
  isShowSign.value = false;
  isShowImage.value = false;
  isShowLiteral.value = false;
  isShowPage.value = false;
}

function usePage(page: number) {
  currentPage.value = page;
}

function toggleNextWarnPopup(isOpen: boolean) {
  // @ts-ignore
  signatureCanvasItem.value.forEach(({ clearActive }) => clearActive());
  isShowNextWarnPopup.value = isOpen;
}

function toggleMergePopup(isOpen: boolean) {
  isShowMergePopup.value = isOpen;
}

onMounted(() => {
  if (!isDesktop()) return;
  isShowSign.value = true;
});
</script>

<template>
  <div class="signature_content content">
    <h5 class="title text-center">簽署文件</h5>

    <div class="flex flex-col h-[calc(100%-88px)] md:flex-row">
      <div class="md:border-r-2 md:border-primary md:py-4 md:px-6">
        <ul class="toolbar signature_content_toolbar">
          <li>
            <sign-icon icon="sign" @click="showSign" :isActive="isShowSign" />
            <p>簽名</p>
          </li>
          <li>
            <sign-icon icon="pic" @click="showImage" :isActive="isShowImage" />
            <p>圖片</p>
          </li>
          <li>
            <sign-icon icon="text" @click="showLiteral" :isActive="isShowLiteral" />
            <p>文字</p>
          </li>
          <li>
            <sign-icon icon="page" @click="showPage" :isActive="isShowPage" />
            <p>頁數</p>
          </li>
        </ul>
        <signature-sign v-model:isShowSign="isShowSign" @useSignature="addFabric" />
        <signature-image v-model:isShowImage="isShowImage" @useImage="addFabric" />
        <signature-literal v-model:isShowLiteral="isShowLiteral" @useLiteral="addFabric" />
        <signature-page v-model:isShowPage="isShowPage" @usePage="usePage" ref="signaturePage" />
      </div>

      <div class="signature_content_file">
        <div class="w-fit h-fit relative">
          <template v-for="page in currentPDF.pages" :key="page">
            <signature-canvas-item 
              v-show="currentPage === page"
              :file="currentPDF"
              :page="page"
              ref="signatureCanvasItem"
            />
          </template>
        </div>
      </div>
    </div>

    <sign-step-btn :isNextDisabled="false" @nextStep="toggleNextWarnPopup(true)" @prevStep="toggleWarnPopup(true)" />
    <sign-popup title="警告" v-if="isShowWarnPopup">
      <p class="text-center">確定要放棄已編輯的內容?</p>
      <div class="flex justify-between md:justify-evenly">
        <button class="btn btn_base" @click="toggleWarnPopup(false)">先不要</button>
        <button class="btn btn_primary" @click="goBack">放棄</button>
      </div>
    </sign-popup>

    <sign-popup title="創建檔案" v-if="isShowNextWarnPopup">
      <p class="text-center">確定已完成簽署文件?</p>
      <div class="flex justify-between md:justify-evenly">
        <button class="btn btn_base" @click="toggleNextWarnPopup(false)">等一下</button>
        <button class="btn btn_primary" @click="mergeFile">確定</button>
      </div>
    </sign-popup>
    <sign-popup title="創建檔案" v-if="isShowMergePopup">
      <div class="flex flex-col gap-8 items-center py-8">
        <img src="@/assets/img/loading.gif" class="w-[60%]" alt="" />

        <div v-if="isMergeComplete" class="text-center">
          <h5 class="text-primary mb-[18px]">檔案已完成</h5>
          <p class="text-gray-40">完成後畫面自動跳轉, 如無跳轉頁面請按確定按鈕。</p>
        </div>
        <h5 v-else class="text-center text-gray-40">合併檔案中...</h5>
      </div>
      <div class="flex justify-between md:justify-evenly">
        <button v-if="isMergeComplete" class="btn btn_primary w-full" @click="goPage('complete')">確定</button>
        <button v-else class="btn btn_base w-full" @click="toggleMergePopup(false)">取消</button>
      </div>
    </sign-popup>
  </div>
</template>

<style lang="postcss" scoped>
.signature_content {
  &_file {
    @apply
    mx-[10px]
    mb-7
    bg-gray-30
    border-2
    border-gray-30
    overflow-auto
    w-[calc(100%-20px)]
    h-full
    md:mt-6
    md:mx-[5%]
    md:mb-0
    md:h-[calc(100%-40px)];
  }
  &_toolbar {
    @apply md:my-0;
    p {
      @apply hidden text-sm whitespace-nowrap md:block;
    }
  }
}
</style>