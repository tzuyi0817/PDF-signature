<script setup lang="ts">
import { ref, defineAsyncComponent, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import imageCompression from 'browser-image-compression';
import type { FabricPointerEvent } from '@component-hook/pdf-canvas/vue';
import SignatureSign from './SignatureSign.vue';
import SignatureToolbar from './SignatureToolbar.vue';
import SignatureImage from './SignatureImage.vue';
import SignatureLiteral from './SignatureLiteral.vue';
import SignaturePage from './SignaturePage.vue';
import SignatureLoading from './SignatureLoading.vue';
import SignatureMergePopup from './SignatureMergePopup.vue';
import SignatureMagnifier from './SignatureMagnifier.vue';
import { onAfterRouteLeave } from '@/router';
import SignStepBtn from '@/components/SignStepBtn.vue';
import { usePdfStore, useConfigStore } from '@/store';
import SignVersion from '@/components/SignVersion.vue';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { useLoadCanvas } from '@/hooks/use-load-canvas';
import { toast } from '@/utils/toast';
import { sleep } from '@/utils/common';
import { canvasToFile } from '@/utils/image';
import type { SignatureTool } from '@/types/menu';

const SignatureCanvasItem = defineAsyncComponent(() => import('@component-hook/pdf-canvas/vue'));
const currentTool = ref<SignatureTool | ''>('');
const isCancelMerge = ref(false);
const currentPage = ref(1);
const isShowNextWarnPopup = ref(false);
const isShowMergePopup = ref(false);
const fileContainerRef = useTemplateRef<HTMLDivElement>('fileContainer');
const fileZoom = ref(1);
const { currentPDF } = storeToRefs(usePdfStore());
const configStore = useConfigStore();
const { t } = useI18n();
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();
const {
  canvasItems: signatureCanvasItems,
  loadedState,
  isCompleted,
  handleCanvasLoaded,
  handleCanvasReload,
} = useLoadCanvas(currentPDF);
const edgeThreshold = 20;
let isGiveUpSignature = false;
let isPointerDown = false;
let requestFrame: number | null = null;

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
  scrollTo({ top: 0, left: 0 });
}

function scrollTo(options: ScrollToOptions) {
  if (!fileContainerRef.value) return;

  fileContainerRef.value.scrollTo(options);
}

function toggleNextWarnPopup(isOpen: boolean) {
  signatureCanvasItems.value?.forEach(({ clearActive }) => clearActive());
  isShowNextWarnPopup.value = isOpen;
}

function toggleMergePopup(isOpen: boolean) {
  isShowMergePopup.value = isOpen;
}

function giveUpSignature() {
  isGiveUpSignature = true;
  goBack();
}

function cancelMergeFile() {
  isCancelMerge.value = true;
  toggleMergePopup(false);
}

function handlePointerDown() {
  isPointerDown = true;
}

function scrollToPerFrame(offsetX: number, offsetY: number) {
  if (!fileContainerRef.value) return;
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = fileContainerRef.value;
  const top = scrollTop + offsetY;
  const left = scrollLeft + offsetX;

  if (top < 0 || left < 0 || top + clientHeight > scrollHeight || left + clientWidth > scrollWidth) {
    if (requestFrame) {
      cancelAnimationFrame(requestFrame);
    }

    requestFrame = null;
    return;
  }

  requestFrame = requestAnimationFrame(() => {
    scrollTo({ top, left });
    scrollToPerFrame(offsetX, offsetY);
  });
}

function handlePointerMove(event: FabricPointerEvent) {
  if (!isPointerDown || !fileContainerRef.value || requestFrame) return;
  const { clientX, clientY } = event.e instanceof TouchEvent ? event.e.touches[0] : event.e;
  const { isAtTopEdge, isAtBottomEdge, isAtLeftEdge, isAtRightEdge } = isPointerAtViewportEdge(clientX, clientY);
  let offsetX = 0;
  let offsetY = 0;

  if (isAtLeftEdge || isAtRightEdge) {
    offsetX = (isAtLeftEdge ? -1 : 1) * edgeThreshold;
  }

  if (isAtTopEdge || isAtBottomEdge) {
    offsetY = (isAtTopEdge ? -1 : 1) * edgeThreshold;
  }

  if (!offsetX && !offsetY) return;

  requestFrame = window.requestAnimationFrame(() => {
    scrollToPerFrame(offsetX, offsetY);
  });
}

function isPointerAtViewportEdge(clientX: number, clientY: number) {
  if (!fileContainerRef.value) return {};
  const { top, bottom, left, right } = fileContainerRef.value.getBoundingClientRect();
  const isAtTopEdge = clientY <= top + edgeThreshold;
  const isAtBottomEdge = clientY >= bottom - edgeThreshold;
  const isAtLeftEdge = clientX <= left + edgeThreshold;
  const isAtRightEdge = clientX >= right - edgeThreshold;

  return { isAtTopEdge, isAtBottomEdge, isAtLeftEdge, isAtRightEdge };
}

function handlePointerUp() {
  isPointerDown = false;
}

onAfterRouteLeave(() => {
  if (!isGiveUpSignature) return;

  usePdfStore().clearCurrentPDF();
});
</script>

<template>
  <div class="signature-content content">
    <h5
      class="title text-center"
      :class="{ 'animate-pulse': !isCompleted }"
    >
      {{ $t('sign_file') }}
      <span
        v-if="!isCompleted"
        class="text-xs text-gray-60 md:text-sm"
        >({{ $t('file_uploading') }})</span
      >
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
        class="signature-content-file"
      >
        <div class="relative w-full h-full">
          <template
            v-for="page in currentPDF.pages"
            :key="page"
          >
            <template v-if="loadedState[page - 1]">
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
                manual-reload
                :on-destroy="onAfterRouteLeave"
                @loaded="handleCanvasLoaded(page)"
                @reload="handleCanvasReload"
                @pointer-down="handlePointerDown"
                @pointer-move="handlePointerMove"
                @pointer-up="handlePointerUp"
              />
            </template>
          </template>

          <signature-loading
            v-if="!loadedState[currentPage]"
            class="absolute"
          />
        </div>
      </div>
      <signature-magnifier v-model="fileZoom" />
    </div>

    <sign-step-btn
      :is-prev-disabled="!isCompleted"
      :is-next-disabled="!isCompleted"
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
          class="btn btn-base"
          @click="toggleWarnPopup(false)"
        >
          {{ $t('not_yet') }}
        </button>
        <button
          class="btn btn-primary"
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
          class="btn btn-base"
          @click="toggleNextWarnPopup(false)"
        >
          {{ $t('wait') }}
        </button>
        <button
          class="btn btn-primary"
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

<style lang="css" scoped>
.signature-content-file {
  margin: 0 10px 28px;
  background-color: var(--color-gray-30);
  border: 2px solid var(--color-gray-30);
  overflow: auto;
  width: calc(100% - 20px);
  height: 100%;
}

@media (min-width: 768px) {
  .signature-content-file {
    margin: 24px 5% 0;
    height: calc(100% - 40px);
  }
}
</style>
