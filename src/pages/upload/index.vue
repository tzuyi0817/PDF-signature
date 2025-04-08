<script setup lang="ts">
import UploadContent from './components/UploadContent.vue';
import SignStep from '@/components/SignStep.vue';
</script>

<template>
  <div class="upload layout">
    <sign-step status="upload" />
    <upload-content />
  </div>
</template>
