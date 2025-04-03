<script setup lang="ts">
import { toast } from '@/utils/toast';

const { msg, status, isShowToast, closeToast } = toast;

const close = closeToast.bind(toast);
</script>

<template>
  <div :class="['sign-toast-container', { 'sign-toast-show': isShowToast }]">
    <div :class="['sign-toast', status === 'success' ? 'bg-primary-dark/90' : 'bg-danger/90']">
      <p class="highlight text-white whitespace-nowrap text-ellipsis overflow-hidden w-fit">
        {{ msg }}
      </p>
      <img
        src="@/assets/icon/ic_close_s_white.svg"
        class="cursor-pointer w-10 h-10"
        alt="close toast icon"
        @click="close"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.sign-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding-left: 1.25rem;
  padding-right: 0.5rem;
  width: fit-content;
  max-width: 90%;
  height: 2.5rem;
  border: 2px solid var(--color-primary);
  border-radius: 50px;
}

@media (min-width: 768px) {
  .sign-toast {
    padding: 1.5rem 0.75rem 1.5rem 15rem;
  }
}

.sign-toast-container {
  position: absolute;
  z-index: 10;
  top: 50px;
  transform: translateY(40px);
  pointer-events: none;
  width: 100%;
  transition: all 150ms ease-in-out;
  opacity: 0;
}

.sign-toast-show {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}
</style>
