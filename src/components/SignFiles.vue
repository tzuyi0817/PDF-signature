<script setup lang="ts">
import { ref, computed } from 'vue';
import SignIcon from '@/components/SignIcon.vue';
import SignFile from '@/components/SignFile.vue';
import type { MenuTab } from '@/types/menu';
import type { PDF } from '@/types/pdf';

interface Props {
  type: MenuTab;
  list: PDF[];
}

const props = defineProps<Props>();
const keyword = ref('');
const searchIconColor = ref('#CCCCCC');
const isShowClose = computed(() => keyword.value);
const search = computed(() => props.list.filter(({ name }) => name.includes(keyword.value)));

function focus() {
  searchIconColor.value = '#B7EC5D';
}

function blur() {
  searchIconColor.value = '#CCCCCC';
}

function clear() {
  keyword.value = '';
}
</script>

<template>
  <div class="sign_files">
    <label class="w-[90%] relative m-3">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="absolute left-1 top-0 duration-500 transition-colors"
      >
        <circle cx="19" cy="19" r="8.75" :stroke="searchIconColor" stroke-width="2.5"/>
        <path d="M25 26L30 31" :stroke="searchIconColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <sign-icon v-show="isShowClose" icon="close_s" customClass="absolute right-1 top-0" @click="clear" />
      <input
        type="text"
        v-model.trim="keyword"
        class="input pl-10"
        placeholder="請輸入關鍵字"
        @focus="focus"
        @blur="blur"
      />
    </label>

    <ul v-if="search.length" class="w-full h-[calc(100%-60px)] overflow-y-auto gap-6 px-[5%]">
      <sign-file
        v-for="(PDF, index) in search"
        :key="PDF.PDFId"
        :file="PDF"
        :index="index"
        :type="type"
      />
    </ul>
  
    <div v-else class="w-[80%] h-[calc(100%-60px)] flex flex-col items-center justify-center gap-10">
      <img src="@/assets/img/img_search.svg" alt="" />
      <h3 class="text-gray-40 text-center">找不到任何符合搜尋條件的項目</h3>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.sign_files {
  @apply w-full flex flex-col items-center h-full;
}
</style>