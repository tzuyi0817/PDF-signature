<script lang="ts" setup>
defineOptions({ name: 'AppFooter' });
</script>

<template>
  <div class="app-footer">
    <img
      src="@/assets/img/bg_decorate.svg"
      alt="background decorate"
    />
  </div>
</template>

<style lang="css" scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  width: 350vw;
  z-index: -1;

  img {
    transform: translateX(-100vw);
  }
}

@media (min-width: 768px) {
  .app-footer img {
    transform: translateX(0);
  }
}
</style>
