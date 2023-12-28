<script setup lang="ts">
import SignHeader from '@/components/SignHeader.vue';
import SignFooter from '@/components/SignFooter.vue';
import SignToast from '@/components/SignToast.vue';
</script>

<template>
  <sign-header />
  <router-view />
  <sign-footer />
  <sign-toast />
</template>

<style lang="postcss" scoped></style>
