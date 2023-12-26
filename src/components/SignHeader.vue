<script setup lang="ts">
import SignIcon from '@/components/SignIcon.vue';
</script>

<template>
  <header class="sign_header">
    <router-link to="/">
      <img
        src="@/assets/logo/logo_darkbg_horizontal.png"
        class="w-36 md:w-[228px]"
        alt="logo"
      />
    </router-link>

    <div class="flex items-center gap-2 md:gap-4">
      <sign-icon
        name="help"
        hoverChangeSvg
        class="w-6 h-6 md:w-[40px] md:h-[40px]"
      />
      <sign-icon
        name="user"
        hoverChangeSvg
        class="w-[30px] h-[30px] md:w-[50px] md:h-[50px]"
      />
    </div>
  </header>
</template>

<style lang="postcss" scoped>
.sign_header {
  @apply fixed w-full flex justify-between items-center bg-black p-2 md:p-4;
}
</style>
