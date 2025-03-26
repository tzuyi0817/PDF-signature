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
  <div class="index-content content">
    <img
      src="@/assets/icon/ic_add_tint.svg"
      alt="Add File Svg"
      class="index-content-add iconScale"
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

<style lang="css" scoped>
.index-content-add {
  width: 60px;
  height: 60px;
  position: absolute;
  right: 12px;
  top: -32px;
}

@media (min-width: 768px) {
  .index-content-add {
    width: 80px;
    height: 80px;
    right: -40px;
    top: 40px;
  }
}
</style>
