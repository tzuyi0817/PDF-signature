<script setup lang="ts">
import { ref } from 'vue';
import IndexMenu from '@/components/index/IndexMenu.vue';
import IndexContent from '@/components/index/IndexContent.vue';
import type { MenuTab } from '@/types/menu';

const currentTab = ref<MenuTab>('file');
</script>

<template>
  <div class="index layout">
    <index-menu v-model:currentTab="currentTab" />
    <index-content :current-tab="currentTab" />
  </div>
</template>
