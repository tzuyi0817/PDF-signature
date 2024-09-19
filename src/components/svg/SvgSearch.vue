<script setup lang="ts">
interface Props {
  color: string;
}

defineProps<Props>();
</script>

<template>
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="absolute left-1 top-0 transition-colors"
    title="search icon"
  >
    <circle
      cx="19"
      cy="19"
      r="8.75"
      :stroke="color"
      stroke-width="2.5"
    />
    <path
      d="M25 26L30 31"
      :stroke="color"
      stroke-width="2.5"
      stroke-linecap="round"
    />
  </svg>
</template>
