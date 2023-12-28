<script setup lang="ts">
import SignStep from '@/components/SignStep.vue';
import UploadContent from '@/components/upload/UploadContent.vue';
</script>

<template>
  <div class="upload layout">
    <sign-step status="upload" />
    <upload-content />
  </div>
</template>
