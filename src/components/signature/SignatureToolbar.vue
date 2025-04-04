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
  <ul class="toolbar signature-toolbar">
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

<style lang="css" scoped>
.signature-toolbar {
  gap: 0;
  margin: 1rem 0.5rem;
}

.signature-toolbar li {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
}

.signature-toolbar li:hover > svg {
  color: var(--color-primary);
}

.signature-toolbar p {
  display: none;
  font-size: 14px;
  line-height: 1.25rem;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .signature-toolbar {
    margin: 0 0.5rem;
  }

  .signature-toolbar p {
    display: block;
  }
}
</style>
