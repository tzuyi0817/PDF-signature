<script setup lang="ts">
import { ref, defineAsyncComponent, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfStore, useConfigStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import { isDesktop, monitorDevicePixelRatio } from '@/utils/common';
import type { SignatureTool } from '@/types/menu';

const emit = defineEmits(['usePage']);
const currentTool = defineModel<SignatureTool | ''>('currentTool');
const currentPage = ref(1);
const devicePixelRatio = ref(window.devicePixelRatio);
const { currentPDF } = storeToRefs(usePdfStore());
const configStore = useConfigStore();
const SignaturePageItem = defineAsyncComponent(() => import('@component-hook/pdf-canvas'));
const stopMonitorDevicePixelRatio = monitorDevicePixelRatio(changeDevicePixelRatio);

function selectPage(page: number) {
  currentPage.value = page;
  isDesktop() && emit('usePage', currentPage.value);
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
    <ul class="signature_list">
      <li
        v-for="page in currentPDF.pages"
        :key="page"
        :class="[
          'rounded-[20px] relative w-full flex flex-shrink-0 justify-center py-3 cursor-pointer overflow-hidden',
          currentPage === page ? 'bg-primary opacity-70' : 'bg-white',
        ]"
        @click="selectPage(page)"
      >
        <suspense>
          <signature-page-item
            :file="currentPDF"
            canvas-id="PDF-page-canvas"
            :page="page"
            canvas-class="border-2 border-gray-20"
            :file-scale="devicePixelRatio * 0.3"
            :password="configStore.filePassword"
          />
          <template #fallback>
            <div class="h-28 animate-pulse leading-[112px] text-center">
              Loading...
            </div>
          </template>
        </suspense>
        <span class="highlight absolute left-4 top-2">{{ `${page}.` }}</span>
        <div
          v-show="currentPage === page"
          class="absolute right-3 top-3 rounded-full bg-danger w-2 h-2"
        ></div>
      </li>
    </ul>
  </signature-popup>
</template>
