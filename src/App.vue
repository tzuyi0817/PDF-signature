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

<style lang="css">
#app {
  width: 100%;
  overflow: hidden;
}

.slide-fade-enter-active {
  transition: all 300ms ease-out;
}

.slide-fade-leave-active {
  transition: all 300ms var(--ease-in-page);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (min-width: 768px) {
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translate(20px, 120px);
  }
}
</style>
