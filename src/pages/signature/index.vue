<script setup lang="ts">
import SignatureContent from './components/SignatureContent.vue';
import SignStep from '@/components/SignStep.vue';
</script>

<template>
  <div class="signature layout">
    <sign-step status="sign" />
    <signature-content />
  </div>
</template>
