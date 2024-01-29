<script setup lang="ts">
import { ref, nextTick, onMounted, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePdfStore } from '@/store';
import SignStepBtn from '@/components/SignStepBtn.vue';
import SignatureSign from '@/components/signature/SignatureSign.vue';
import SignatureToolbar from '@/components/signature/SignatureToolbar.vue';
import SignatureImage from '@/components/signature/SignatureImage.vue';
import SignatureLiteral from '@/components/signature/SignatureLiteral.vue';
import SignaturePage from '@/components/signature/SignaturePage.vue';
import SignatureLoading from '@/components/signature/SignatureLoading.vue';
import SignatureMergePopup from '@/components/signature/SignatureMergePopup.vue';
import SignatureMagnifier from '@/components/signature/SignatureMagnifier.vue';
import useResize from '@/hooks/useResize';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';
import { sleep } from '@/utils/common';
import type { SignatureTool } from '@/types/menu';

const SignatureCanvasItem = defineAsyncComponent(() => import('@/components/signature/SignatureCanvasItem.vue'));
const currentTool = ref<SignatureTool | ''>('');
const isCancelMerge = ref(false);
const currentPage = ref(1);
const isShowNextWarnPopup = ref(false);
const isShowMergePopup = ref(false);
const signatureCanvasItems = ref<InstanceType<typeof SignatureCanvasItem>[] | null>(null);
const fileContainerRef = ref<HTMLDivElement | null>(null);
const fileContainerWidth = ref(0);
const fileZoom = ref(1);
const { currentPDF } = storeToRefs(usePdfStore());
const { t } = useI18n();
const { isShowWarnPopup, SignPopup, goBack, goPage, toggleWarnPopup } = useWarnPopup();

useResize(updateFileContainerWidth);

async function mergeFile() {
  toggleNextWarnPopup(false);
  toggleMergePopup(true);

  try {
    if (!signatureCanvasItems.value) return;
    const { setCurrentPDFCanvas, addPDF } = usePdfStore();
    const canvas = signatureCanvasItems.value.map(({ canvasDom }) => {
      if (!canvasDom) return '';

      return canvasDom.toDataURL('image/png', 1.0);
    });

    await sleep(2000);
    if (isCancelMerge.value) {
      isCancelMerge.value = false;
      return;
    }
    setCurrentPDFCanvas(canvas);
    addPDF({ ...currentPDF.value, PDFBase64: '', updateDate: Date.now() });
    toast.showToast(t('prompt.file_created_success'), 'success');
    goPage('complete');
  } catch {
    toast.showToast(t('prompt.operation_timed_out'), 'error');
  } finally {
    toggleMergePopup(false);
  }
}

function addFabric(value: string, type?: string) {
  if (!signatureCanvasItems.value) return;
  const proxy = signatureCanvasItems.value.at(currentPage.value - 1);
  if (!proxy) return;

  type === 'text' ? proxy.addTextFabric(value) : proxy.addFabric(value);
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

async function updateFileContainerWidth() {
  await nextTick();
  fileContainerWidth.value = fileContainerRef.value?.clientWidth ?? 0;
}

function giveUpSignature() {
  usePdfStore().clearCurrentPDF();
  goBack();
}

function cancelMergeFile() {
  isCancelMerge.value = true;
  toggleMergePopup(false);
}

onMounted(updateFileContainerWidth);
</script>

<template>
  <div class="signature_content content">
    <h5 class="title text-center">{{ $t('sign_file') }}</h5>

    <div class="flex flex-col h-[calc(100%-88px)] md:flex-row">
      <div class="md:border-r-2 md:border-primary md:py-4 md:px-6">
        <signature-toolbar v-model:currentTool="currentTool" />
        <signature-sign
          v-model:currentTool="currentTool"
          @use-signature="addFabric"
        />
        <signature-image
          v-model:currentTool="currentTool"
          @use-image="addFabric"
        />
        <signature-literal
          v-model:currentTool="currentTool"
          @use-literal="addFabric"
        />
        <signature-page
          v-model:currentTool="currentTool"
          @use-page="usePage"
        />
      </div>

      <div
        ref="fileContainerRef"
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
                :file-container-width="fileContainerWidth"
                :file="currentPDF"
                :file-zoom="fileZoom"
                :page="page"
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
    <sign-popup
      v-if="isShowWarnPopup"
      :title="$t('warn')"
    >
      <p class="text-center">{{ $t('prompt.sure_discard_edited_content') }}</p>
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
      <p class="text-center">{{ $t('prompt.sure_completed_sign') }}</p>
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
