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
    <sign-files
      v-if="PDFList.length"
      type="file"
      :list="PDFList"
    />

    <div
      v-else
      class="h-full flex flex-col items-center justify-center gap-5"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        class="iconScale w-[80px] h-[80] md:w-[136px] md:h-[136px]"
        @click="goPage('upload')"
      />
      <h3 class="text-center">{{ $t('prompt.create_file') }}</h3>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.index_files {
  @apply h-[calc(100%-38px)] md:h-[calc(100%-66px)];
}
</style>
