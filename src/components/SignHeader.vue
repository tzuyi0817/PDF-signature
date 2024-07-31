<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SignIcon from '@/components/SignIcon.vue';
import { I18N_MAP } from '@/configs/common';

const isShowLanguageMenu = ref(false);
const { locale } = useI18n();
let closeMenuTimer: NodeJS.Timeout | null = null;

function changeLocale(code: string) {
  locale.value = code;
  localStorage.setItem('pdf-signature-i18n', code);
  isShowLanguageMenu.value = false;
}

function openLanguageMenu() {
  if (closeMenuTimer) {
    clearTimeout(closeMenuTimer);
    closeMenuTimer = null;
  }
  isShowLanguageMenu.value = true;
}

function closeLanguageMenu() {
  closeMenuTimer = setTimeout(() => {
    isShowLanguageMenu.value = false;
  }, 150);
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
      <div
        class="relative"
        @mouseover="openLanguageMenu"
        @mouseleave="closeLanguageMenu"
      >
        <sign-icon
          name="global"
          class="sign_header_icon text-gray-40 mt-0.5"
        />

        <div
          v-show="isShowLanguageMenu"
          class="absolute -bottom-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white"
        ></div>

        <teleport to="body">
          <ul
            :class="['sign_header_language', isShowLanguageMenu ? 'scale-y-100' : 'scale-y-0']"
            @mouseover="openLanguageMenu"
            @mouseleave="closeLanguageMenu"
          >
            <li
              v-for="(name, language) in I18N_MAP"
              :key="language"
              :class="['text-gray-50', { 'text-black bg-primary': locale === language }]"
              @click="changeLocale(language)"
            >
              {{ name }}
            </li>
          </ul>
        </teleport>
      </div>

      <a
        href="https://github.com/tzuyi0817/PDF-signature"
        target="_blank"
        rel="noopener noreferrer"
      >
        <sign-icon
          name="github"
          class="sign_header_icon text-gray-40"
        />
      </a>
    </div>
  </header>
</template>

<style lang="postcss" scoped>
.sign_header {
  @apply fixed w-full flex justify-between items-center bg-black p-2 md:p-4;
  &_icon {
    @apply w-6 h-6 md:w-8 md:h-8 active:scale-90;
  }
  &_language {
    @apply fixed
    bg-white
    shadow-md
    rounded-lg
    px-3
    py-2
    max-h-[50%]
    overflow-y-auto
    overflow-x-hidden
    transition-transform
    origin-top
    top-12
    right-3
    md:grid
    md:grid-cols-3
    md:top-[70px]
    md:gap-x-6
    md:gap-y-1
    md:right-5;
    li {
      @apply px-3 py-2 cursor-pointer rounded hover:bg-primary hover:text-black transition-colors;
    }
  }
}
</style>
