<script setup lang="ts">
import { onMounted } from 'vue';
import SignIcon from '@/components/SignIcon.vue';
import { isDesktop } from '@/utils/common';
import type { SignatureTool } from '@/types/menu';

const currentTool = defineModel<SignatureTool | ''>('currentTool');

function selectTool(tool: SignatureTool) {
  currentTool.value = tool;
}

onMounted(() => {
  if (!isDesktop()) return;
  selectTool('sign');
});
</script>

<template>
  <ul class="toolbar signature_toolbar">
    <li @click="selectTool('sign')">
      <sign-icon
        name="sign"
        :class="['w-7 h-7', { 'text-primary': currentTool === 'sign' }]"
      />
      <p>{{ $t('sign') }}</p>
    </li>
    <li @click="selectTool('image')">
      <sign-icon
        name="pic"
        :class="['w-7 h-7', { 'text-primary': currentTool === 'image' }]"
      />
      <p>{{ $t('picture') }}</p>
    </li>
    <li @click="selectTool('literal')">
      <sign-icon
        name="text"
        :class="['w-7 h-7', { 'text-primary': currentTool === 'literal' }]"
      />
      <p>{{ $t('text') }}</p>
    </li>
    <li @click="selectTool('page')">
      <sign-icon
        name="page"
        :class="['w-7 h-7', { 'text-primary': currentTool === 'page' }]"
      />
      <p>{{ $t('pages') }}</p>
    </li>
  </ul>
</template>

<style lang="postcss" scoped>
.signature {
  &_toolbar {
    @apply gap-0 mx-2 md:my-0;
    li {
      @apply flex flex-col items-center min-w-[52px];
      &:hover > svg {
        @apply text-primary;
      }
    }
    p {
      @apply hidden text-sm whitespace-nowrap md:block;
    }
  }
}
</style>
