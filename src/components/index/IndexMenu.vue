<script setup lang="ts">
import type { MenuTab } from '@/types/menu';

interface Props {
  currentTab: MenuTab;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:currentTab']);

function changeTab(tab: MenuTab) {
  emit('update:currentTab', tab);
}
</script>

<template>
  <ul class="index_menu">
    <li :class="currentTab === 'file' ? 'bg-white' : 'bg-gray-60'" @click="changeTab('file')">
      <img src="@/assets/icon/ic_file_h.svg" alt="" />
    </li>
    <li :class="currentTab === 'archive' ? 'bg-white' : 'bg-gray-60'" @click="changeTab('archive')">
      <img src="@/assets/icon/ic_archive_h.svg" alt="" />
    </li>
    <li :class="currentTab === 'trash' ? 'bg-white' : 'bg-gray-60'" @click="changeTab('trash')">
      <img src="@/assets/icon/ic_trash_h.svg" alt="" />
    </li>
  </ul>
</template>

<style lang="postcss" scoped>
.index_menu {
  @apply flex gap-1 ml-5;
  li {
    @apply
    border-2
    border-b-0
    border-gray-70
    flex
    justify-center
    items-center
    w-12
    pt-2
    h-[42px]
    cursor-pointer
    transition-colors
    duration-500
    drop-shadow-md
    rounded-t-[100px];
    img {
      @apply w-[22px];
    }
  }
}
</style>