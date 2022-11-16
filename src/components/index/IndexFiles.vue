<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import useRedirect from '@/hooks/useRedirect';
import SignFiles from '@/components/SignFiles.vue';

const { goPage } = useRedirect();
const { PDFList } = storeToRefs(usePdfStore());
</script>

<template>
  <div class="index_files">
    <sign-files v-if="PDFList.length" type="file" :list="PDFList" />

    <div v-else class="h-full flex flex-col items-center justify-center gap-5">
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="80"
        height="80"
        class="index_files_add"
        @click="goPage('upload')"
      />
      <h2>快來建立新檔吧</h2>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.index_files {
  @apply h-[calc(100%-38px)];
  &_add {
    @apply cursor-pointer transition-transform duration-500 hover:scale-90;
  }
}
</style>