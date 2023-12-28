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
        <h5 class="mb-2">沒有任何項目</h5>
        <p>刪除的項目會顯示在這裡</p>
      </div>
    </div>

    <p class="index_trash_warn">垃圾桶中的項目會在 30 天後永久刪除</p>
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
    whitespace-nowrap
    border-2
    border-primary
    shadow
    shadow-primary
    rounded-[50px]
    absolute
    left-1/2
    -translate-x-1/2
    -bottom-6
    md:-bottom-3;
  }
}
</style>
