<script setup lang="ts">
import SignStep from '@/components/SignStep.vue';
import CompleteContent from './components/CompleteContent.vue';
</script>

<template>
  <div class="complete layout">
    <sign-step status="complete" />
    <complete-content />
  </div>
</template>
