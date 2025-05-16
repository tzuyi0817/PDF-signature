<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/stores';
import HomeSignFiles from './HomeSignFiles.vue';

const { trashList } = storeToRefs(usePdfStore());

usePdfStore().filterTrash();
</script>

<template>
  <div class="index-trash index-container">
    <home-sign-files
      v-if="trashList.length"
      type="trash"
      :list="trashList"
    />

    <div
      v-else
      class="h-full flex flex-col items-center justify-center gap-[35px]"
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

    <div class="absolute w-full flex justify-center left-0 -bottom-4 md:-bottom-3">
      <p class="index-trash-warn shadow shadow-primary">
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
  background-color: var(--color-white);
  width: fit-content;
  border: 2px solid var(--color-primary);
  border-radius: 50px;
}

@media (min-width: 768px) {
  .index-trash-warn {
    padding: 8px 20px;
  }
}
</style>
