<script setup lang="ts">
import SignStep from '@/components/SignStep.vue';
import SignatureContent from '@/components/signature/SignatureContent.vue';
</script>

<template>
  <div class="signature layout">
    <sign-step status="sign" />
    <signature-content />
  </div>
</template>
