<script setup lang="ts">
interface Props {
  title: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="sign_popup">
    <div class="sign_popup_box">
      <h5 class="border-b-2 border-primary py-1 px-4 text-center">{{ title }}</h5>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.sign_popup {
  @apply fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center;
  &_box {
    @apply
    w-[90%]
    h-[40%]
    max-w-[530px]
    max-h-[335px]
    px-8
    pt-4
    pb-7
    shadow-[0px_4px_15px_rgba(0,0,0,0.2),inset_0px_2px_5px_rgba(135,135,135,0.2),inset_0px_3px_10px_rgba(215,215,215,0.2),inset_0px_-1px_4px_rgba(135,135,135,0.6),inset_0px_-6px_6px_rgba(215,215,215,0.4)]
    rounded-[40px]
    flex
    flex-col
    justify-between
    bg-white;
  }
}
</style>