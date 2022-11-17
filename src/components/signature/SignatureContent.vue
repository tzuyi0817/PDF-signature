<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignIcon from '@/components/SignIcon.vue';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignatureSign from '@/components/signature/SignatureSign.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import useFabric from '@/hooks/useFabric';

const isNextDisabled = ref(true);
const isShowSign = ref(false);
const currentPage = ref(1);
const { currentPDF } = storeToRefs(usePdfStore());
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();
const { createCanvas, specifyPage } = useFabric('canvas');

function setPDF() {
  createCanvas();
  specifyPage({
    page: currentPage.value,
    PDF: currentPDF.value,
    scale: 2,
  });
}

function showSign() {
  isShowSign.value = true;
}

onMounted(setPDF)
</script>

<template>
  <div class="signature_content content">
    <h5 class="title text-center">簽署文件</h5>

    <ul class="toolbar">
      <li><sign-icon icon="sign" @click="showSign" /></li>
      <li><sign-icon icon="pic" @click="" /></li>
      <li><sign-icon icon="text" @click="" /></li>
      <li><sign-icon icon="page" @click="" /></li>
    </ul>

    <div class="signature_content_file">
      <div class="py-5 px-3 w-fit h-fit">
        <canvas id="canvas"></canvas>
      </div>
    </div>

    <sign-step-btn :isNextDisabled="isNextDisabled" @nextStep="goPage('signature')" @prevStep="toggleWarnPopup(true)" />
    <sign-popup title="警告" v-if="isShowWarnPopup">
      <p class="text-center">確定要放棄已編輯的內容?</p>
      <div class="flex justify-between">
        <button class="btn btn_base" @click="toggleWarnPopup(false)">先不要</button>
        <button class="btn btn_primary" @click="goBack">放棄</button>
      </div>
    </sign-popup>
    <signature-sign v-model:isShowSign="isShowSign" />
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
    h-[calc(100%-178px)];
  }
}
</style>