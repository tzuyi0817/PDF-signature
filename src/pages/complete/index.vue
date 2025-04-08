<script setup lang="ts">
import CompleteContent from './components/CompleteContent.vue';
import SignStep from '@/components/SignStep.vue';
</script>

<template>
  <div class="complete layout">
    <sign-step status="complete" />
    <complete-content />
  </div>
</template>
