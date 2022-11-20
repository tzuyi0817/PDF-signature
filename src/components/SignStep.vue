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
    <span :class="['sign_step_text -left-5', status === 'upload' ? 'text-primary' : 'text-gray-40']">上傳檔案</span>
    <span :class="['sign_step_text', status === 'sign' ? 'text-primary' : 'text-gray-40']">簽署文件</span>
    <span :class="['sign_step_text -right-5', status === 'complete' ? 'text-primary' : 'text-gray-40']">簽署完成</span>
  </div>
</template>

<style lang="postcss" scoped>
.sign_step {
  @apply relative flex py-[15px] items-center justify-center md:fixed md:-top-28 md:left-1/2 md:-translate-x-1/2;
  &_dot {
    @apply box-border w-[10px] h-[10px] bg-black border-2 border-gray-40 rounded-full md:w-4 md:h-4;
    &-light {
      @apply border-primary shadow-[0px_0px_0px_4px_rgba(183,236,93,0.5)];
    }
    &-complete {
      @apply border-primary bg-primary;
    }
  }
  &_line {
    @apply w-[90px] h-[2px] md:w-[210px];
  }
  &_text {
    @apply hidden absolute text-sm top-10 md:block;
  }
}
</style>