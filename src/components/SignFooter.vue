<script setup lang="ts">

</script>

<template>
  <div class="sign_footer">
    <img src="@/assets/img/bg_decorate.svg" alt="">
  </div>
</template>

<style lang="postcss" scoped>
.sign_footer {
  @apply fixed bottom-0 w-[350vw] -z-[1] ;
  img {
    @apply -translate-x-[100vw] md:translate-x-0;
  }
}
</style>