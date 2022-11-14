<script setup lang="ts">
import { reactive } from 'vue';

const files = reactive([]);
</script>

<template>
  <div class="index_files">
    <div v-if="!files.length" class="flex flex-col items-center gap-5">
      <img src="@/assets/icon/ic_add_dark.svg" alt="" width="80" height="80" />
      <h2>快來建立新檔吧</h2>
    </div>

    <ul>
      <li v-for="file in files"></li>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
.index_files {
  @apply flex items-center justify-center h-[calc(100%-38px)];
}
</style>