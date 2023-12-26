<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignaturePageItem from '@/components/signature/SignaturePageItem.vue';
import { isDesktop } from '@/utils/common';

interface Props {
  isShowPage: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:isShowPage', 'usePage']);
const currentPage = ref(1);
const { currentPDF } = storeToRefs(usePdfStore());

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
    :isShowPopup="isShowPage"
    title="選擇頁面"
    :isDisabled="false"
    customUseBtnName="選擇"
    @close="close"
    @use="usePage"
  >
    <ul class="signature_page_content signature_list">
      <li
        v-for="page in currentPDF.pages"
        :key="page"
        @click="selectPage(page)"
        :class="[
          'rounded-[20px] relative w-full flex justify-center py-3 cursor-pointer',
          currentPage === page ? 'bg-primary opacity-70' : 'bg-white',
        ]"
      >
        <signature-page-item
          :file="currentPDF"
          :page="page"
        />
        <span class="highlight absolute left-4 top-2">{{ `${page}.` }}</span>
        <div
          v-show="currentPage === page"
          class="absolute right-3 top-3 rounded-full bg-danger w-2 h-2"
        ></div>
      </li>
    </ul>
  </signature-popup>
</template>
