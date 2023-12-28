<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignFiles from '@/components/SignFiles.vue';

const { archiveList } = storeToRefs(usePdfStore());
</script>

<template>
  <div class="index_archives">
    <sign-files
      v-if="archiveList.length"
      type="archive"
      :list="archiveList"
    />

    <div
      v-else
      class="h-full flex flex-col items-center justify-center gap-[35px]"
    >
      <img
        src="@/assets/img/img_archive.svg"
        alt=""
      />

      <div class="text-gray-40 text-center">
        <h5 class="mb-2">沒有任何項目</h5>
        <p>封存的項目會顯示在這裡</p>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.index_archives {
  @apply h-[calc(100%-38px)];
}
</style>
