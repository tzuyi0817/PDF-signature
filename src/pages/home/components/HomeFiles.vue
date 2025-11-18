<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRedirect } from '@/hooks/use-redirect';
import { usePdfStore } from '@/stores';
import HomeSignFiles from './HomeSignFiles.vue';

const { goPage } = useRedirect();
const { PDFList } = storeToRefs(usePdfStore());
</script>

<template>
  <div class="index-files index-container">
    <home-sign-files
      v-if="PDFList.length"
      type="file"
      :list="PDFList"
    />

    <div
      v-else
      class="flex h-full flex-col items-center justify-center gap-5"
    >
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt="create file"
        class="iconScale h-20 w-20 md:h-[136px] md:w-[136px]"
        @click="goPage('upload')"
      />
      <h3 class="text-center">
        {{ $t('prompt.create_file') }}
      </h3>
    </div>
  </div>
</template>
