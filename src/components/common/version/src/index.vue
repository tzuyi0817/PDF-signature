<script setup lang="ts">
defineOptions({ name: 'Version' });

const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
  <p class="text-gray-40 absolute right-3 bottom-1 text-xs md:bottom-2">ver: {{ version }}</p>
</template>
