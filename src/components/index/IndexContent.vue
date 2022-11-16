<script setup lang="ts">
import { computed } from 'vue';
import IndexFiles from '@/components/index/IndexFiles.vue';
import IndexArchives from '@/components/index/IndexArchives.vue';
import IndexTrash from '@/components/index/IndexTrash.vue';
import useRedirect from '@/hooks/useRedirect';
import type { MenuTab } from '@/types/menu';

interface Props {
  currentTab: MenuTab;
}

const props = defineProps<Props>();
const { goPage } = useRedirect();
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
    <img
        src="@/assets/icon/ic_add_tint.svg"
        alt=""
        class="index_content_add"
        @click="goPage('upload')"
      />
    <h5 class="title">{{ title }}</h5>
    <component :is="currentCom"></component>
  </div>
</template>

<style lang="postcss" scoped>
.index_content {
  &_add {
    @apply
    w-[60px]
    h-[60px]
    absolute
    right-3
    -top-8
    cursor-pointer
    transition-transform
    duration-500
    hover:scale-90
    md:w-20
    md:h-20;
  }
}
</style>
