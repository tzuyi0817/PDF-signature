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
  <div class="index_content content">
    <h5 class="title">{{ title }}</h5>
    <component :is="currentCom"></component>
  </div>
</template>
