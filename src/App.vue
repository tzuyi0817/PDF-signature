<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SignFooter from '@/components/SignFooter.vue';
import SignHeader from '@/components/SignHeader.vue';
import SignLoading from '@/components/SignLoading.vue';
import SignReload from '@/components/SignReload.vue';
import SignToast from '@/components/SignToast.vue';
import { emitRouteEvent } from '@/router/events';

const router = useRouter();
const routeCurrent = ref<string>('');
const routePrevious = ref<string>('');

router.beforeEach((to, from) => {
  routeCurrent.value = String(to.name);
  routePrevious.value = String(from.name);
});
</script>

<template>
  <sign-header />
  <router-view v-slot="{ Component }">
    <transition
      name="slide-fade"
      mode="out-in"
      @before-enter="emitRouteEvent('onBeforeEnter', routeCurrent)"
      @enter="emitRouteEvent('onEnter', routeCurrent)"
      @after-enter="emitRouteEvent('onAfterEnter', routeCurrent)"
      @before-leave="emitRouteEvent('onBeforeLeave', routePrevious)"
      @leave="emitRouteEvent('onLeave', routePrevious)"
      @after-leave="emitRouteEvent('onAfterLeave', routePrevious)"
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
