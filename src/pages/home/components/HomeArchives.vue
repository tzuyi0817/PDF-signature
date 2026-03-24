<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { usePdfStore } from '@/stores';
import HomeSearch from './HomeSearch.vue';
import HomeSignFiles from './HomeSignFiles.vue';

const { archiveList } = storeToRefs(usePdfStore());
const keyword = ref('');
</script>

<template>
  <div class="index-archives index-container">
    <template v-if="archiveList.length">
      <home-search v-model="keyword" />

      <home-sign-files
        type="archive"
        :list="archiveList"
        :keyword
      />
    </template>

    <div
      v-else
      class="flex h-full flex-col items-center justify-center gap-8.75"
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
