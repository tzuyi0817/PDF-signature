<script setup lang="ts">
import SingIcon from '@/components/SignIcon.vue';

</script>

<template>
  <header class="sign_header">
    <img src="@/assets/logo/logo_darkbg_horizontal.png" class="w-36 md:w-64" alt="" />

    <div class="flex gap-2 md:gap-4">
      <sing-icon icon="help" customClass="w-[24px] md:w-[40px]" />
      <sing-icon icon="user" customClass="w-[30px] md:w-[50px]" />
    </div>
  </header>
</template>

<style lang="postcss" scoped>
.sign_header {
  @apply fixed w-full flex justify-between items-center bg-black p-2 md:p-4;
}
</style>