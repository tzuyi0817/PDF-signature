<script setup lang="ts">
import { computed } from 'vue';
import IndexFiles from '@/components/index/IndexFiles.vue';
import IndexArchives from '@/components/index/IndexArchives.vue';
import IndexTrash from '@/components/index/IndexTrash.vue';
import SignVersion from '@/components/SignVersion.vue';
import { useRedirect } from '@/hooks/use-redirect';
import type { MenuTab } from '@/types/menu';

interface Props {
  currentTab: MenuTab;
}

const { currentTab } = defineProps<Props>();
const { goPage } = useRedirect();
const title = computed(() => {
  const titleMap = {
    file: 'my_files',
    archive: 'archived_files',
    trash: 'trash_bin',
  };
  return titleMap[currentTab];
});

const currentCom = computed(() => {
  const componentMap = {
    file: IndexFiles,
    archive: IndexArchives,
    trash: IndexTrash,
  };
  return componentMap[currentTab];
});
</script>

<template>
  <div class="index_content content">
    <img
      src="@/assets/icon/ic_add_tint.svg"
      alt="Add File Svg"
      class="index_content_add iconScale"
      @click="goPage('upload')"
    />
    <h5 class="title">
      {{ $t(title) }}
    </h5>
    <sign-version />

    <keep-alive>
      <component :is="currentCom" />
    </keep-alive>
  </div>
</template>

<style lang="postcss" scoped>
.index_content {
  &_add {
    @apply w-[60px] h-[60px] absolute right-3 -top-8 md:w-20 md:h-20 md:-right-10 md:top-10;
  }
}
</style>
