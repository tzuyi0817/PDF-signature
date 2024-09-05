<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SignIcon from '@/components/SignIcon.vue';
import { sleep } from '@/utils/common';
import { I18N_MAP } from '@/configs/common';

const isShowLanguageMenu = ref(false);
const isDisplayLanguageMenu = ref(false);
const { locale } = useI18n();
let closeMenuTimer: NodeJS.Timeout | null = null;
let isClosingMenu = false;

function changeLocale(code: string) {
  locale.value = code;
  localStorage.setItem('pdf-signature-i18n', code);
  isClosingMenu = true;
  isShowLanguageMenu.value = false;
}

async function openLanguageMenu() {
  if (isClosingMenu) return;
  if (closeMenuTimer) {
    clearTimeout(closeMenuTimer);
    closeMenuTimer = null;
  }
  isDisplayLanguageMenu.value = true;
  await sleep(0);
  isShowLanguageMenu.value = true;
}

function closeLanguageMenu() {
  closeMenuTimer = setTimeout(() => {
    isShowLanguageMenu.value = false;
  }, 150);
}

function onTransitionEnd(event: TransitionEvent) {
  if (event.propertyName !== 'transform' || isShowLanguageMenu.value) return;
  isDisplayLanguageMenu.value = false;
  isClosingMenu = false;
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
          v-if="isDisplayLanguageMenu"
          :class="['sign_header_menu_arrow sign_header_transition', { 'opacity-0 scale-y-0': !isShowLanguageMenu }]"
        ></div>

        <teleport to="body">
          <div
            v-if="isDisplayLanguageMenu"
            :class="['sign_header_menu sign_header_transition', { 'scale-y-0 opacity-0': !isShowLanguageMenu }]"
            @transitionend="onTransitionEnd"
            @mouseover="openLanguageMenu"
            @mouseleave="closeLanguageMenu"
          >
            <ul class="sign_header_language">
              <li
                v-for="(name, language) in I18N_MAP"
                :key="language"
                :class="['text-gray-50', { 'text-black bg-primary': locale === language }]"
                @click="changeLocale(language)"
              >
                {{ name }}
              </li>
            </ul>
          </div>
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
  &_menu {
    @apply fixed h-fit px-2 py-2 bg-white shadow-md rounded-lg top-12 right-3 origin-top md:top-[70px] md:right-5;
    &_arrow {
      @apply absolute -bottom-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white origin-bottom;
      clip-path: inset(0 0 1.5px 0);
    }
  }
  &_language {
    @apply max-h-[50dvh] px-2 overflow-y-auto overflow-x-hidden md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-1;
    li {
      @apply px-3 py-2 cursor-pointer rounded hover:bg-primary hover:text-black transition-colors;
    }
  }
  &_transition {
    @apply transition-[transform_opacity] duration-300;
  }
}
</style>
