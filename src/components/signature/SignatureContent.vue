<script setup lang="ts">
import { ref, defineAsyncComponent, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import imageCompression from 'browser-image-compression';
import { usePdfStore, useConfigStore } from '@/store';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignatureSign from '@/components/signature/SignatureSign.vue';
import SignatureToolbar from '@/components/signature/SignatureToolbar.vue';
import SignatureImage from '@/components/signature/SignatureImage.vue';
import SignatureLiteral from '@/components/signature/SignatureLiteral.vue';
import SignaturePage from '@/components/signature/SignaturePage.vue';
import SignatureLoading from '@/components/signature/SignatureLoading.vue';
import SignatureMergePopup from '@/components/signature/SignatureMergePopup.vue';
import SignatureMagnifier from '@/components/signature/SignatureMagnifier.vue';
import SignVersion from '@/components/SignVersion.vue';
import { useWarnPopup } from '@/hooks/useWarnPopup';
import { toast } from '@/utils/toast';
import { sleep } from '@/utils/common';
import { canvasToFile } from '@/utils/image';
import type { SignatureTool } from '@/types/menu';

const SignatureCanvasItem = defineAsyncComponent(() => import('@component-hook/pdf-canvas'));
const currentTool = ref<SignatureTool | ''>('');
const isCancelMerge = ref(false);
const currentPage = ref(1);
const isShowNextWarnPopup = ref(false);
const isShowMergePopup = ref(false);
const signatureCanvasItems = ref<InstanceType<typeof SignatureCanvasItem>[] | null>(null);
const fileContainerRef = useTemplateRef<HTMLDivElement>('fileContainer');
const fileZoom = ref(1);
const { currentPDF } = storeToRefs(usePdfStore());
const configStore = useConfigStore();
const { t } = useI18n();
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();

async function mergeFile() {
  toggleNextWarnPopup(false);
  toggleMergePopup(true);
  await sleep();

  window.requestAnimationFrame(async () => {
    try {
      if (!signatureCanvasItems.value) return;
      const { setCurrentPDFCanvas, addPDF, updatePDF } = usePdfStore();
      const compressPromises = signatureCanvasItems.value.map(async ({ canvasRef }) => {
        if (!canvasRef) return '';
        const imageFile = await canvasToFile(canvasRef);

        return imageCompression(imageFile, { useWebWorker: true });
      });

      const compressedBlobs = await Promise.all(compressPromises);
      const blobToBase64Promises = compressedBlobs.map(blob => blob && imageCompression.getDataUrlFromFile(blob));
      const canvas = await Promise.all(blobToBase64Promises);

      if (isCancelMerge.value) {
        isCancelMerge.value = false;
        return;
      }
      setCurrentPDFCanvas(canvas);
      const file = { ...currentPDF.value, PDFBase64: '', updateDate: Date.now() };

      if (file.isUpdate) {
        updatePDF(file);
      } else {
        addPDF(file);
      }
      toast.showToast(t('prompt.file_created_success'), 'success');
      goPage('complete');
    } catch {
      toast.showToast(t('prompt.operation_timed_out'), 'error');
    } finally {
      toggleMergePopup(false);
    }
  });
}

function addFabric(value: string, type?: string) {
  if (!signatureCanvasItems.value) return;
  const proxy = signatureCanvasItems.value.at(currentPage.value - 1);

  if (!proxy) return;
  if (type === 'text') {
    proxy.addText(value);
    return;
  }
  proxy.addImage(value);
}

function usePage(page: number) {
  currentPage.value = page;
  fileContainerRef.value?.scrollTo({ top: 0, left: 0 });
}

function toggleNextWarnPopup(isOpen: boolean) {
  signatureCanvasItems.value?.forEach(({ clearActive }) => clearActive());
  isShowNextWarnPopup.value = isOpen;
}

function toggleMergePopup(isOpen: boolean) {
  isShowMergePopup.value = isOpen;
}

function giveUpSignature() {
  usePdfStore().clearCurrentPDF();
  goBack();
}

function cancelMergeFile() {
  isCancelMerge.value = true;
  toggleMergePopup(false);
}
</script>

<template>
  <div class="signature_content content">
    <h5 class="title text-center">
      {{ $t('sign_file') }}
    </h5>

    <div class="flex flex-col h-[calc(100%-88px)] md:flex-row">
      <div class="md:border-r-2 md:border-primary md:py-4 md:px-6">
        <signature-toolbar v-model:current-tool="currentTool" />
        <signature-sign
          v-model:current-tool="currentTool"
          @use-signature="addFabric"
        />
        <signature-image
          v-model:current-tool="currentTool"
          @use-image="addFabric"
        />
        <signature-literal
          v-model:current-tool="currentTool"
          @use-literal="addFabric"
        />
        <signature-page
          v-model:current-tool="currentTool"
          @use-page="usePage"
        />
      </div>

      <div
        ref="fileContainer"
        class="signature_content_file"
      >
        <div class="relative w-full h-full">
          <template
            v-for="page in currentPDF.pages"
            :key="page"
          >
            <suspense>
              <signature-canvas-item
                v-show="currentPage === page"
                ref="signatureCanvasItems"
                class="absolute py-5 px-3 origin-top-left md:py-10 md:px-14"
                :file="currentPDF"
                :file-zoom="fileZoom"
                :file-scale="6.8"
                :page="page"
                :canvas-scale="0.6"
                :password="configStore.filePassword"
                is-drop
              />
              <template
                v-if="currentPage === page"
                #fallback
              >
                <signature-loading />
              </template>
            </suspense>
          </template>
        </div>
      </div>
      <signature-magnifier v-model="fileZoom" />
    </div>

    <sign-step-btn
      :is-next-disabled="false"
      @next-step="toggleNextWarnPopup(true)"
      @prev-step="toggleWarnPopup(true)"
    />
    <sign-version />
    <sign-popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">
        {{ $t('prompt.sure_discard_edited_content') }}
      </p>
      <div class="flex justify-between md:justify-evenly">
        <button
          class="btn btn_base"
          @click="toggleWarnPopup(false)"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn_primary"
          @click="giveUpSignature"
        >
          {{ $t('give_up') }}
        </button>
      </div>
    </sign-popup>

    <sign-popup
      v-if="isShowNextWarnPopup"
      :title="$t('create_file')"
    >
      <p class="text-center">
        {{ $t('prompt.sure_completed_sign') }}
      </p>
      <div class="flex justify-between md:justify-evenly">
        <button
          class="btn btn_base"
          @click="toggleNextWarnPopup(false)"
        >
          {{ $t('wait') }}
        </button>
        <button
          class="btn btn_primary"
          @click="mergeFile"
        >
          {{ $t('confirm') }}
        </button>
      </div>
    </sign-popup>

    <signature-merge-popup
      :is-show-merge-popup="isShowMergePopup"
      :cancel-merge-file="cancelMergeFile"
    />
  </div>
</template>

<style lang="postcss" scoped>
.signature_content {
  &_file {
    @apply mx-[10px]
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
}
</style>
