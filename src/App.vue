<script setup lang="ts">
import SignHeader from '@/components/SignHeader.vue';
import SignFooter from '@/components/SignFooter.vue';
import SignLoading from '@/components/SignLoading.vue';
import SignToast from '@/components/SignToast.vue';
</script>

<template>
  <sign-header />
  <router-view />
  <sign-footer />
  <sign-loading />
  <sign-toast />
</template>

<style lang="postcss" scoped></style>
