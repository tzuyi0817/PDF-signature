<script setup lang="ts">
import toast from '@/utils/toast';

const { msg, status, isShowToast, closeToast } = toast;

const close = closeToast.bind(toast);
</script>

<template>
  <div
    :class="[
      'sign_toast',
      { 'sign_toast-show': isShowToast },
      status === 'success' ? 'bg-primary-dark/90' : 'bg-danger/90',
    ]"
  >
    <p class="highlight text-white">{{ msg }}</p>
    <img
      src="@/assets/icon/ic_close_s_white.svg"
      alt=""
      @click="close"
    />
  </div>
</template>

<style lang="postcss" scoped>
.sign_toast {
  @apply absolute
  top-[50px]
  left-1/2
  -translate-x-1/2
  translate-y-10
  items-center
  justify-between
  flex
  pl-5
  pr-2
  pointer-events-none
  whitespace-nowrap
  text-ellipsis
  overflow-hidden
  w-fit
  max-w-[100vw]
  h-10
  transition-all
  opacity-0
  border-primary
  border-2
  rounded-[50px]
  md:-translate-x-[calc(50%+40px)];
  &-show {
    @apply translate-y-0 opacity-100 pointer-events-auto;
  }
}
</style>
