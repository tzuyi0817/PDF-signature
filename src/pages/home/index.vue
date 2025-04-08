<script setup lang="ts">
import { ref } from 'vue';
import HomeMenu from './components/HomeMenu.vue';
import HomeContent from './components/HomeContent.vue';
import type { MenuTab } from '@/types/menu';

const currentTab = ref<MenuTab>('file');
</script>

<template>
  <div class="index layout">
    <home-menu v-model:current-tab="currentTab" />
    <home-content :current-tab="currentTab" />
  </div>
</template>
