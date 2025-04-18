<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { defineAsyncComponent, onBeforeUnmount, ref } from 'vue';
import { useLoadCanvas } from '@/hooks/use-load-canvas';
import { useConfigStore, usePdfStore } from '@/store';
import { isDesktop, monitorDevicePixelRatio } from '@/utils/common';
import type { SignatureTool } from '@/types/menu';
import SignaturePopup from './SignaturePopup.vue';

const emit = defineEmits(['usePage']);
const currentTool = defineModel<SignatureTool | ''>('currentTool');
const currentPage = ref(1);
const devicePixelRatio = ref(window.devicePixelRatio);
const { currentPDF } = storeToRefs(usePdfStore());
const configStore = useConfigStore();
const { loadedState, canvasItems, handleCanvasLoaded, handleCanvasReload } = useLoadCanvas(currentPDF);
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
          'rounded-[20px] relative w-full flex flex-shrink-0 justify-center py-3 cursor-pointer overflow-hidden min-h-32',
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
          @reload="handleCanvasReload"
        />

        <div
          v-if="!loadedState[page]"
          class="absolute h-28 animate-pulse leading-[112px] text-center"
        >
          Loading...
        </div>

        <span class="highlight absolute left-4 top-2">{{ `${page}.` }}</span>
        <div
          v-show="currentPage === page"
          class="absolute right-3 top-3 rounded-full bg-danger w-2 h-2"
        ></div>
      </li>
    </ul>
  </signature-popup>
</template>
