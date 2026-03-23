<script setup lang="ts">
defineOptions({ name: 'SvgList' });
</script>

<template>
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="hidden transition-colors lg:block"
    title="list icon"
  >
    <rect
      x="13"
      y="12"
      width="14"
      height="16"
      rx="2"
      stroke-width="2"
    />
    <path
      d="M17 16H23"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M17 20H23"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M17 24H21"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style lang="css" scoped>
svg {
  rect,
  path {
    stroke: var(--color-surface-text);
  }
}
</style>
