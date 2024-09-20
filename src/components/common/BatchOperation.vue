<script lang="ts" setup>
import SignIcon from '@/components/SignIcon.vue';
import type { MenuTab } from '@/types/menu';

interface Props {
  type: MenuTab;
}

defineProps<Props>();
</script>

<template>
  <div class="flex gap-3">
    <sign-icon
      v-if="type === 'file'"
      name="archive"
      class="w-6 h-6"
    />
    <sign-icon
      v-if="type === 'file' || type === 'archive'"
      name="trash"
      class="w-6 h-6"
    />
    <sign-icon
      v-if="type === 'trash'"
      name="reduction"
      class="w-6 h-6"
    />
  </div>
</template>
