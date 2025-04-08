<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SignIcon from '@/components/SignIcon.vue';
import { sleep } from '@/utils/common';
import { I18N_MAP } from '@/constants/common';

const isShowLanguageMenu = ref(false);
const isDisplayLanguageMenu = ref(false);
const { locale } = useI18n();
let closeMenuTimer: NodeJS.Timeout | null = null;
let isClosingMenu = false;

async function changeLocale(code: string) {
  locale.value = code;
  localStorage.setItem('pdf-signature-i18n', code);
  isClosingMenu = true;
  await sleep(0);
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
  if (event.propertyName !== 'scale' || isShowLanguageMenu.value) return;
  isDisplayLanguageMenu.value = false;
  isClosingMenu = false;
}
</script>

<template>
  <header class="sign-header">
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
          class="sign-header-icon text-gray-40 mt-0.5"
        />

        <div
          v-if="isDisplayLanguageMenu"
          :class="['sign-header-menu-arrow sign-header-transition', { 'opacity-0 scale-y-0': !isShowLanguageMenu }]"
        ></div>

        <teleport to="body">
          <div
            v-if="isDisplayLanguageMenu"
            :class="['sign-header-menu sign-header-transition', { 'scale-y-0 opacity-0': !isShowLanguageMenu }]"
            @transitionend="onTransitionEnd"
            @mouseover="openLanguageMenu"
            @mouseleave="closeLanguageMenu"
          >
            <ul class="sign-header-language">
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
          class="sign-header-icon text-gray-40"
        />
      </a>
    </div>
  </header>
</template>

<style lang="css" scoped>
.sign-header {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: black;
  padding: 0.5rem;
}

.sign-header-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.sign-header-icon:active {
  transform: scale(0.9);
}

.sign-header-menu {
  position: fixed;
  height: fit-content;
  padding: 0.5rem;
  background-color: white;
  box-shadow:
    0 4px 6px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1)),
    0 2px 4px -2px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
  border-radius: 0.5rem;
  top: 3rem;
  right: 0.75rem;
  transform-origin: top;
}

.sign-header-menu-arrow {
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-color: transparent;
  border-bottom-color: white;
  transform-origin: bottom;
  clip-path: inset(0 0 1.5px 0);
}

.sign-header-language {
  max-height: 50dvh;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.sign-header-language li {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.sign-header-language li:hover {
  background-color: var(--color-primary);
  color: black;
}

.sign-header-transition {
  transition:
    scale 0.3s,
    opacity 0.3s;
}

@media (min-width: 768px) {
  .sign-header {
    padding: 1rem;
  }

  .sign-header-icon {
    width: 2rem;
    height: 2rem;
  }

  .sign-header-menu {
    top: 70px;
    right: 1.25rem;
  }

  .sign-header-language {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem 1.5rem;
  }
}
</style>
