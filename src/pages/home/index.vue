<script setup lang="ts">
import { ref } from 'vue';
import HomeContent from './components/HomeContent.vue';
import HomeMenu from './components/HomeMenu.vue';
import type { MenuTab } from '@/types/menu';

const currentTab = ref<MenuTab>('file');
</script>

<template>
  <div class="index layout md:-translate-x-10">
    <home-menu v-model:current-tab="currentTab" />
    <home-content :current-tab="currentTab" />
  </div>
</template>
