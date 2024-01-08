<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePdfStore } from '@/store';
import SignFiles from '@/components/SignFiles.vue';

const { trashList } = storeToRefs(usePdfStore());

usePdfStore().filterTrash();
</script>

<template>
  <div class="index_trash">
    <sign-files
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
        alt=""
      />

      <div class="text-gray-40 text-center">
        <h5 class="mb-2">{{ $t('prompt.no_items') }}</h5>
        <p>{{ $t('prompt.deleted_projects') }}</p>
      </div>
    </div>

    <div class="absolute w-full flex justify-center left-0 -bottom-6 md:-bottom-3">
      <p class="index_trash_warn">{{ $t('prompt.trash_shelf_life') }}</p>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.index_trash {
  @apply relative h-[calc(100%-38px)];
  &_warn {
    @apply text-danger
    text-center
    px-5
    py-2
    bg-white
    w-fit
    border-2
    border-primary
    shadow
    shadow-primary
    rounded-[50px];
  }
}
</style>
