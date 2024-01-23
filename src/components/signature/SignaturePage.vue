<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import { isDesktop } from '@/utils/common';

interface Props {
  isShowPage: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:isShowPage', 'usePage']);
const currentPage = ref(1);
const { currentPDF } = storeToRefs(usePdfStore());
const SignaturePageItem = defineAsyncComponent(() => import('@/components/signature/SignaturePageItem.vue'));

function selectPage(page: number) {
  currentPage.value = page;
  isDesktop() && emit('usePage', currentPage.value);
}

function usePage() {
  emit('usePage', currentPage.value);
  close();
}

function close() {
  emit('update:isShowPage', false);
}
</script>

<template>
  <signature-popup
    :is-show-popup="isShowPage"
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
            :page="page"
          />
          <template #fallback>
            <div class="h-28 animate-pulse leading-[112px] text-center">Loading...</div>
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
