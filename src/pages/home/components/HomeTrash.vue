<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { usePdfStore } from '@/stores';
import HomeSearch from './HomeSearch.vue';
import HomeSignFiles from './HomeSignFiles.vue';

const { trashList } = storeToRefs(usePdfStore());
const keyword = ref('');

usePdfStore().filterTrash();
</script>

<template>
  <div class="index-trash index-container">
    <template v-if="trashList.length">
      <home-search v-model="keyword" />

      <home-sign-files
        type="trash"
        :list="trashList"
        :keyword
      />
    </template>

    <div
      v-else
      class="flex h-full flex-col items-center justify-center gap-8.75"
    >
      <img
        src="@/assets/img/img_trash.svg"
        alt="trash icon"
      />

      <div class="text-gray-40 text-center">
        <h5 class="mb-2">
          {{ $t('prompt.no_items') }}
        </h5>
        <p>{{ $t('prompt.deleted_projects') }}</p>
      </div>
    </div>

    <div class="absolute -bottom-4 left-0 flex w-full justify-center lg:-bottom-3">
      <p class="index-trash-warn shadow-primary shadow">
        {{ $t('prompt.trash_shelf_life') }}
      </p>
    </div>
  </div>
</template>

<style lang="css" scoped>
.index-trash-warn {
  color: var(--color-danger);
  text-align: center;
  padding: 4px 20px;
  background-color: var(--color-surface);
  width: fit-content;
  border: 2px solid var(--color-primary);
  border-radius: 50px;
}

@media (min-width: 1024px) {
  .index-trash-warn {
    padding: 8px 20px;
  }
}
</style>
