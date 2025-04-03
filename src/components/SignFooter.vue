<template>
  <div class="sign-footer">
    <img
      src="@/assets/img/bg_decorate.svg"
      alt="background decorate"
    />
  </div>
</template>

<style lang="css" scoped>
.sign-footer {
  position: fixed;
  bottom: 0;
  width: 350vw;
  z-index: -1;

  img {
    transform: translateX(-100vw);
  }
}

@media (min-width: 768px) {
  .sign-footer img {
    transform: translateX(0);
  }
}
</style>
