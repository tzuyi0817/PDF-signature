<script setup lang="ts">
import { computed } from 'vue';
import IndexFiles from '@/components/index/IndexFiles.vue';
import IndexArchives from '@/components/index/IndexArchives.vue';
import IndexTrash from '@/components/index/IndexTrash.vue';
import type { MenuTab } from '@/types/menu';

interface Props {
  currentTab: MenuTab;
}

const props = defineProps<Props>();
const title = computed(() => {
  const titleMap = {
    file: '我的文件',
    archive: '已封存的文件',
    trash: '垃圾桶',
  }
  return titleMap[props.currentTab];
});

const currentCom = computed(() => {
  const componentMap = {
    file: IndexFiles,
    archive: IndexArchives,
    trash: IndexTrash,
  }
  return componentMap[props.currentTab];
});
</script>

<template>
  <div class="index_content">
    <h5 class="border-b-2 border-primary py-1 px-4">{{ title }}</h5>
    <component :is="currentCom"></component>
  </div>
</template>

<style lang="postcss" scoped>
.index_content {
  @apply
  w-full
  h-[calc(100vh-120px)]
  bg-white
  p-3
  shadow-[inset_0px_2px_4px_rgba(135,135,135,0.35),inset_0px_5px_8px_rgba(215,215,215,0.3),inset_0px_-2px_4px_rgba(135,135,135,0.65),inset_0px_-6px_6px_rgba(215,215,215,0.55)]
  rounded-[20px];
}
</style>