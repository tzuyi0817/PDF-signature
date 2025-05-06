<script setup lang="ts">
import imageCompression from 'browser-image-compression';
import { storeToRefs } from 'pinia';
import { computed, defineAsyncComponent, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignVersion from '@/components/SignVersion.vue';
import { DRAG_MOVE_STEP } from '@/constants/common';
import { useLoadCanvas } from '@/hooks/use-load-canvas';
import { usePointerFabric } from '@/hooks/use-pointer-fabric';
import { useWarnPopup } from '@/hooks/use-warn-popup';
import { onAfterRouteLeave } from '@/router';
import { useConfigStore, usePdfStore } from '@/store';
import { sleep } from '@/utils/common';
import { canvasToFile } from '@/utils/image';
import type { DragOffset } from '@/types/drag';
import type { SignatureTool } from '@/types/menu';
import SignatureImage from './SignatureImage.vue';
import SignatureLiteral from './SignatureLiteral.vue';
import SignatureLoading from './SignatureLoading.vue';
import SignatureMergePopup from './SignatureMergePopup.vue';
import SignaturePage from './SignaturePage.vue';
import SignaturePanel from './SignaturePanel.vue';
import SignatureSign from './SignatureSign.vue';
import SignatureToolbar from './SignatureToolbar.vue';

const CANVAS_SCALE = 0.6;
const SignatureCanvasItem = defineAsyncComponent(() => import('@component-hook/pdf-canvas/vue'));
const currentTool = ref<SignatureTool | ''>('');
const isCancelMerge = ref(false);
const currentPage = ref(1);
const isShowNextWarnPopup = ref(false);
const isShowMergePopup = ref(false);
const fileContainerRef = useTemplateRef<HTMLDivElement>('fileContainer');
const fileZoom = ref(1);
const dragOffset = ref<DragOffset>({ x: 0, y: 0, width: 0, height: 0 });
const isActivatedFabric = ref(false);
const { currentPDF } = storeToRefs(usePdfStore());
const configStore = useConfigStore();
const { t } = useI18n();
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();
const { handlePointerDown, handlePointerMove, handlePointerUp } = usePointerFabric(fileContainerRef);
const {
  canvasItems: signatureCanvasItems,
  loadedState,
  isCompleted,
  canvasRect,
  handleCanvasLoaded,
  handleCanvasReload,
} = useLoadCanvas(currentPDF, true);

const canvasWidth = computed(() => `${canvasRect.value.width * fileZoom.value * CANVAS_SCALE}px`);
const canvasHeight = computed(() => `${canvasRect.value.height * fileZoom.value * CANVAS_SCALE}px`);

const currentCanvasItem = computed(() => {
  if (!signatureCanvasItems.value) return null;

  return signatureCanvasItems.value.at(currentPage.value - 1);
});

let isGiveUpSignature = false;
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
      showToast(t('prompt.file_created_success'));
      goPage('complete');
    } catch {
      showToast({ message: t('prompt.operation_timed_out'), type: 'error' });
    } finally {
      toggleMergePopup(false);
    }
  });
}

function addFabric(value: string, type?: string) {
  const canvas = currentCanvasItem.value;

  if (!canvas) return;
  const action = type === 'text' ? canvas.addText : canvas.addImage;

  action(value);
}

function usePage(page: number) {
  currentCanvasItem.value?.clearActive();
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

function handleDragOver(event: DragEvent) {
  if (!fileContainerRef.value) return;
  const { clientX, clientY } = event;
  const rect = fileContainerRef.value.getBoundingClientRect();
  const { x, y, height, width } = dragOffset.value;
  const top = clientY <= rect.top + y;
  const bottom = clientY >= rect.bottom - (height - y);
  const left = clientX <= rect.left + x;
  const right = clientX >= rect.right - (width - x);
  let offsetX = 0;
  let offsetY = 0;

  cancelScrollToPerFrame();

  if (left || right) {
    offsetX = left ? -DRAG_MOVE_STEP : DRAG_MOVE_STEP;
  }

  if (top || bottom) {
    offsetY = top ? -DRAG_MOVE_STEP : DRAG_MOVE_STEP;
  }

  if (!offsetX && !offsetY) return;

  requestFrame = window.requestAnimationFrame(() => {
    scrollToPerFrame(offsetX, offsetY);
  });
}

function scrollToPerFrame(offsetX: number, offsetY: number) {
  if (!fileContainerRef.value) return;
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = fileContainerRef.value;
  const top = scrollTop + offsetY;
  const left = scrollLeft + offsetX;

  if (top < 0 || left < 0 || top + clientHeight > scrollHeight || left + clientWidth > scrollWidth) {
    cancelScrollToPerFrame();
    return;
  }

  requestFrame = requestAnimationFrame(() => {
    scrollTo({ top, left });
    scrollToPerFrame(offsetX, offsetY);
  });
}

function cancelScrollToPerFrame() {
  if (!requestFrame) return;

  cancelAnimationFrame(requestFrame);
  requestFrame = null;
}

onAfterRouteLeave(() => {
  if (!isGiveUpSignature) return;

  usePdfStore().clearCurrentPDF();
});
</script>

<template>
  <div class="signature-content content flex flex-col">
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

    <div class="flex flex-col min-h-0 flex-1 md:flex-row">
      <div class="md:border-r-2 md:border-primary md:py-4 md:px-6">
        <signature-toolbar v-model:current-tool="currentTool" />
        <signature-sign
          v-model:current-tool="currentTool"
          v-model:drag-offset="dragOffset"
          @use-signature="addFabric"
        />
        <signature-image
          v-model:current-tool="currentTool"
          v-model:drag-offset="dragOffset"
          @use-image="addFabric"
        />
        <signature-literal
          v-model:current-tool="currentTool"
          v-model:drag-offset="dragOffset"
          @use-literal="addFabric"
        />
        <signature-page
          v-model:current-tool="currentTool"
          @use-page="usePage"
        />
      </div>

      <div class="signature-content-file">
        <div
          ref="fileContainer"
          class="relative w-full h-full overflow-auto touch-pan-x touch-pan-y pt-3 px-2 pb-11 md:pt-6 md:px-8"
          @dragover.stop.prevent="handleDragOver"
          @dragleave.stop.prevent="cancelScrollToPerFrame"
        >
          <div :style="{ width: canvasWidth, height: canvasHeight }">
            <template
              v-for="page in currentPDF.pages"
              :key="page"
            >
              <template v-if="loadedState[page - 1]">
                <signature-canvas-item
                  v-show="currentPage === page"
                  ref="signatureCanvasItems"
                  class="origin-top-left absolute"
                  :file="currentPDF"
                  :file-zoom="fileZoom"
                  :file-scale="6.8"
                  :page="page"
                  :canvas-scale="CANVAS_SCALE"
                  :password="configStore.filePassword"
                  is-drop
                  manual-reload
                  :close-svg-options="{ src: '' }"
                  :on-destroy="onAfterRouteLeave"
                  @loaded="handleCanvasLoaded(page)"
                  @reload="handleCanvasReload"
                  @pointer-down="handlePointerDown"
                  @pointer-move="handlePointerMove"
                  @pointer-up="handlePointerUp"
                  @selection-created="isActivatedFabric = true"
                  @selection-cleared="isActivatedFabric = false"
                />
              </template>
            </template>
          </div>

          <signature-loading
            v-if="!loadedState[currentPage]"
            class="absolute"
          />
        </div>

        <signature-panel
          v-model:file-zoom="fileZoom"
          :is-activated-fabric="isActivatedFabric"
          @copy-fabric="currentCanvasItem?.copyActiveFabric"
          @delete-fabric="currentCanvasItem?.deleteActiveFabric"
        />
      </div>
    </div>

    <sign-step-btn
      class="pb-2.5"
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
  width: calc(100% - 20px);
  min-height: 0;
  flex: 1 1 0%;
  position: relative;
}

@media (min-width: 768px) {
  .signature-content-file {
    margin: 24px 5% 0;
    min-width: 0;
    height: calc(100% - 58px);
  }
}
</style>
