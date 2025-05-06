<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SignIcon from '@/components/SignIcon.vue';
import { I18N_MAP } from '@/constants/common';
import { sleep } from '@/utils/common';
import SignStep from './SignStep.vue';

defineOptions({ name: 'AppHeader' });

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
  <header class="app-header">
    <router-link to="/">
      <img
        src="@/assets/logo/logo_darkbg_horizontal.png"
        class="w-36 md:w-[228px]"
        alt="logo"
      />
    </router-link>

    <sign-step />

    <div class="flex items-center gap-2 md:gap-4">
      <div
        class="relative"
        @mouseover="openLanguageMenu"
        @mouseleave="closeLanguageMenu"
      >
        <sign-icon
          name="global"
          class="app-header-icon text-gray-40 mt-0.5"
        />

        <div
          v-if="isDisplayLanguageMenu"
          :class="['app-header-menu-arrow app-header-transition', { 'opacity-0 scale-y-0': !isShowLanguageMenu }]"
        ></div>

        <teleport to="body">
          <div
            v-if="isDisplayLanguageMenu"
            :class="['app-header-menu app-header-transition', { 'scale-y-0 opacity-0': !isShowLanguageMenu }]"
            @transitionend="onTransitionEnd"
            @mouseover="openLanguageMenu"
            @mouseleave="closeLanguageMenu"
          >
            <ul class="app-header-language">
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
          class="app-header-icon text-gray-40"
        />
      </a>
    </div>
  </header>
</template>

<style lang="css" scoped>
.app-header {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: black;
  padding: 8px;
  z-index: 1;
}

.app-header-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.app-header-icon:active {
  transform: scale(0.9);
}

.app-header-menu {
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
  z-index: 1;
}

.app-header-menu-arrow {
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

.app-header-language {
  max-height: 50dvh;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-header-language li {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.app-header-language li:hover {
  background-color: var(--color-primary);
  color: black;
}

.app-header-transition {
  transition:
    scale 0.3s,
    opacity 0.3s;
}

@media (min-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .app-header-icon {
    width: 2rem;
    height: 2rem;
  }

  .app-header-menu {
    top: 70px;
    right: 1.25rem;
  }

  .app-header-language {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem 1.5rem;
  }
}
</style>
