<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

function changeLocale(code: string) {
  locale.value = code;
  localStorage.setItem('pdf-signature-i18n', code);
}
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
      <button
        :class="['btn_small btn_primary', { active: locale === 'zh-TW' }]"
        @click="changeLocale('zh-TW')"
      >
        中文
      </button>
      <button
        :class="['btn_small btn_primary', { active: locale === 'en-US' }]"
        @click="changeLocale('en-US')"
      >
        English
      </button>
    </div>
  </header>
</template>

<style lang="postcss" scoped>
.sign_header {
  @apply fixed w-full flex justify-between items-center bg-black p-2 md:p-4;
}
</style>
