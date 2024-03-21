<script setup lang="ts">
const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
  <p
    class="fixed top-12 right-1 bg-[rgba(183,236,93,0.8)] text-xs rounded py-0.5 px-1.5 md:top-[84px] md:right-2 md:text-sm md:py-1 md:px-2"
  >
    {{ version }}
  </p>
</template>
