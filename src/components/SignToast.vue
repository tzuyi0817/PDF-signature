<script setup lang="ts">
import toast from '@/utils/toast';

const { msg, status, isShowToast, closeToast } = toast;

const close = closeToast.bind(toast);
</script>

<template>
  <div :class="['sign_toast_container', { 'sign_toast-show': isShowToast }]">
    <div :class="['sign_toast', status === 'success' ? 'bg-primary-dark/90' : 'bg-danger/90']">
      <p class="highlight text-white whitespace-nowrap text-ellipsis overflow-hidden w-fit">{{ msg }}</p>
      <img
        src="@/assets/icon/ic_close_s_white.svg"
        class="cursor-pointer w-10 h-10"
        alt="close toast icon"
        @click="close"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.sign_toast {
  @apply items-center
  justify-between
  mx-auto
  flex
  pl-5
  pr-2
  md:pl-6
  md:pr-3
  md:py-6
  w-fit
  max-w-[90%]
  h-10
  border-primary
  border-2
  rounded-[50px];
  &_container {
    @apply absolute z-10 top-[50px] translate-y-10 pointer-events-none w-full transition-all opacity-0;
  }
  &-show {
    @apply translate-y-0 opacity-100 pointer-events-auto;
  }
}
</style>
