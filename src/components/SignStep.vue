<script setup lang="ts">
interface Props {
  status: 'upload' | 'sign' | 'complete';
}

const props = defineProps<Props>();
</script>

<template>
  <div class="sign_step">
    <div :class="[
      'sign_step_dot',
      { 'sign_step_dot-light': status === 'upload' },
      { 'sign_step_dot-complete': status === 'sign' || status === 'complete' },
    ]"></div>
    <div :class="['sign_step_line', status === 'sign' || status === 'complete' ? 'bg-primary' : 'bg-gray-40']"></div>
    <div :class="[
      'sign_step_dot',
      { 'sign_step_dot-light': status === 'sign' },
      { 'sign_step_dot-complete': status === 'complete' },
    ]"></div>
    <div :class="['sign_step_line', status === 'complete' ? 'bg-primary' : 'bg-gray-40']"></div>
    <div :class="['sign_step_dot', { 'sign_step_dot-light': status === 'complete' }]"></div>
  </div>
</template>

<style lang="postcss" scoped>
.sign_step {
  @apply flex py-[15px] items-center justify-center;
  &_dot {
    @apply box-border w-[10px] h-[10px] bg-black border-2 border-gray-40 rounded-full;
    &-light {
      @apply border-primary shadow-[0px_0px_0px_4px_rgba(183,236,93,0.5)];
    }
    &-complete {
      @apply border-primary bg-primary;
    }
  }
  &_line {
    @apply w-[90px] h-[2px];
  }
}
</style>