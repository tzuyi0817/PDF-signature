<script setup lang="ts">
import { reactive } from 'vue';
import useRedirect from '@/hooks/useRedirect';

const files = reactive([]);
const { goPage } = useRedirect();
</script>

<template>
  <div class="index_files">
    <ul v-if="files.length">
      <li v-for="file in files"></li>
    </ul>

    <div v-else class="flex flex-col items-center gap-5">
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
  @apply flex items-center justify-center h-[calc(100%-38px)];
  &_add {
    @apply cursor-pointer transition-transform duration-500 hover:scale-90;
  }
}
</style>