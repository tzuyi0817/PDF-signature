<script setup lang="ts">
import SignStep from '@/components/SignStep.vue';
import CompleteContent from '@/components/complete/CompleteContent.vue';
</script>

<template>
  <div class="complete layout">
    <sign-step status="complete" />
    <complete-content />
  </div>
</template>
