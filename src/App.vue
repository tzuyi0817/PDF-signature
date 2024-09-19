<script setup lang="ts">
import SignHeader from '@/components/SignHeader.vue';
import SignFooter from '@/components/SignFooter.vue';
import SignLoading from '@/components/SignLoading.vue';
import SignToast from '@/components/SignToast.vue';
import SignReload from '@/components/SignReload.vue';
</script>

<template>
  <sign-header />
  <router-view v-slot="{ Component }">
    <transition
      name="slide-fade"
      mode="out-in"
    >
      <component :is="Component" />
    </transition>
  </router-view>
  <sign-footer />
  <sign-loading />
  <sign-toast />
  <sign-reload />
</template>

<style lang="postcss">
#app {
  @apply w-full overflow-hidden;
}

.slide-fade-enter-active {
  @apply transition-all duration-300 ease-out;
}

.slide-fade-leave-active {
  @apply transition-all duration-300 ease-in-page;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  @apply opacity-0 translate-x-5;
}
</style>
