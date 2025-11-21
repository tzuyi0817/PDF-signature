<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { defineAsyncComponent, onBeforeUnmount, ref } from 'vue';
import { useLoadCanvas } from '@/hooks/use-load-canvas';
import { useConfigStore, usePdfStore } from '@/stores';
import { isDesktop, monitorDevicePixelRatio } from '@/utils/common';
import type { SignatureTool } from '@/types/menu';
import SignaturePopup from './SignaturePopup.vue';

const emit = defineEmits(['usePage']);
const currentTool = defineModel<SignatureTool | ''>('currentTool');
const devicePixelRatio = ref(window.devicePixelRatio);
const { currentPDF } = storeToRefs(usePdfStore());
const configStore = useConfigStore();
const { currentPage, loadedState, canvasItems, handleCanvasLoaded } = useLoadCanvas(currentPDF);
const SignaturePageItem = defineAsyncComponent(() => import('@component-hook/pdf-canvas/vue'));
const stopMonitorDevicePixelRatio = monitorDevicePixelRatio(changeDevicePixelRatio);

function selectPage(page: number) {
  currentPage.value = page;
  if (!isDesktop()) return;
  emit('usePage', currentPage.value);
}

function usePage() {
  emit('usePage', currentPage.value);
  close();
}

function close() {
  currentTool.value = '';
}

function changeDevicePixelRatio() {
  devicePixelRatio.value = window.devicePixelRatio;
}

onBeforeUnmount(() => {
  stopMonitorDevicePixelRatio();
});
</script>

<template>
  <signature-popup
    :is-show-popup="currentTool === 'page'"
    :title="$t('select_page')"
    :is-disabled="false"
    :custom-use-btn-name="$t('select')"
    @close="close"
    @use="usePage"
  >
    <ul class="signature-list">
      <li
        v-for="page in currentPDF.pages"
        :key="page"
        :class="[
          'relative flex min-h-32 w-full shrink-0 cursor-pointer justify-center overflow-hidden rounded-[20px] py-3',
          currentPage === page ? 'bg-primary opacity-70' : 'bg-white',
        ]"
        @click="selectPage(page)"
      >
        <signature-page-item
          v-if="loadedState[page - 1]"
          ref="canvasItems"
          class="pointer-events-none"
          :file="currentPDF"
          canvas-id="PDF-page-canvas"
          :page="page"
          :canvas-class="loadedState[page] ? 'border-2 border-gray-20' : undefined"
          :file-scale="devicePixelRatio * 0.3"
          :password="configStore.filePassword"
          manual-reload
          @loaded="handleCanvasLoaded(page)"
        />

        <div
          v-if="!loadedState[page]"
          class="absolute h-28 animate-pulse text-center leading-28"
        >
          Loading...
        </div>

        <span class="highlight absolute top-2 left-4">{{ `${page}.` }}</span>
        <div
          v-show="currentPage === page"
          class="bg-danger absolute top-3 right-3 h-2 w-2 rounded-full"
        ></div>
      </li>
    </ul>
  </signature-popup>
</template>
