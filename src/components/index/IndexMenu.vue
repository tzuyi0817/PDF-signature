<script setup lang="ts">
import type { MenuTab } from '@/types/menu';

const currentTab = defineModel<MenuTab>('currentTab');

function changeTab(tab: MenuTab) {
  currentTab.value = tab;
}
</script>

<template>
  <ul class="index-menu">
    <li
      :class="currentTab === 'file' ? 'bg-white' : 'bg-gray-60'"
      @click="changeTab('file')"
    >
      <img
        src="@/assets/icon/ic_file_h.svg"
        alt="file icon"
      />
    </li>
    <li
      :class="currentTab === 'archive' ? 'bg-white' : 'bg-gray-60'"
      @click="changeTab('archive')"
    >
      <img
        src="@/assets/icon/ic_archive_h.svg"
        alt="archive icon"
      />
    </li>
    <li
      :class="currentTab === 'trash' ? 'bg-white' : 'bg-gray-60'"
      @click="changeTab('trash')"
    >
      <img
        src="@/assets/icon/ic_trash_h.svg"
        alt="trash icon"
      />
    </li>
  </ul>
</template>

<style lang="css" scoped>
.index-menu {
  display: flex;
  gap: 4px;
  margin-left: 20px;
}

.index-menu li {
  border: 2px solid var(--color-gray-70);
  border-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  padding-top: 8px;
  height: 42px;
  cursor: pointer;
  transition: background-color 0.2s;
  filter: drop-shadow(var(--drop-shadow-md));
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
}

.index-menu li:hover {
  background-color: white;
}

.index-menu li img {
  width: 22px;
}

@media (min-width: 768px) {
  .index-menu {
    flex-direction: column;
    gap: 10px;
    transform: translateY(82px);
  }

  .index-menu li {
    width: 62px;
    height: 56px;
    transform: translateX(4px) rotate(-90deg);
  }

  .index-menu li img {
    width: 28px;
    transform: rotate(90deg);
  }
}
</style>
