<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/stores';
import HomeSignFiles from './HomeSignFiles.vue';

const { archiveList } = storeToRefs(usePdfStore());
</script>

<template>
  <div class="index-archives index-container">
    <home-sign-files
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
        alt="archive icon"
      />

      <div class="text-gray-40 text-center">
        <h5 class="mb-2">
          {{ $t('prompt.no_items') }}
        </h5>
        <p>{{ $t('prompt.archived_projects') }}</p>
      </div>
    </div>
  </div>
</template>
