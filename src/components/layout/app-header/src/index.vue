<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Describedby, SvgIcon } from '@/components/common';
import { I18N_MAP } from '@/constants/common';
import { sleep } from '@/utils/common';
import { useTheme } from './hooks/use-theme';
import SignStep from './SignStep.vue';

defineOptions({ name: 'AppHeader' });

const isShowLanguageMenu = ref(false);
const isDisplayLanguageMenu = ref(false);
const { locale } = useI18n();
const { theme, toggleTheme } = useTheme();
let closeMenuTimer: ReturnType<typeof setTimeout> | null = null;
let isClosingMenu = false;

const themeIcon = computed(() => {
  const iconMap = { light: 'sun', dark: 'moon', system: 'monitor' } as const;

  return iconMap[theme.value];
});

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
  <div class="safe-area-top"></div>

  <header class="app-header">
    <router-link to="/">
      <img
        src="@/assets/logo/logo_darkbg_horizontal.png"
        class="w-36 lg:w-57"
        alt="logo"
      />
    </router-link>

    <sign-step />

    <div class="flex items-center gap-2 lg:gap-4">
      <div
        class="relative"
        @mouseover="openLanguageMenu"
        @mouseleave="closeLanguageMenu"
      >
        <svg-icon
          name="global"
          class="app-header-icon text-gray-40 mt-0.5"
        />

        <div
          v-if="isDisplayLanguageMenu"
          :class="['app-header-menu-arrow app-header-transition', { 'opacity-0': !isShowLanguageMenu }]"
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
                :class="[locale === language ? 'bg-primary text-black' : 'dark:text-gray-30 text-gray-50']"
                @click="changeLocale(language)"
              >
                {{ name }}
              </li>
            </ul>
          </div>
        </teleport>
      </div>

      <describedby
        :title="$t(`theme_${theme}`)"
        position="bottom"
      >
        <button
          class="flex items-center"
          @click="toggleTheme"
        >
          <svg-icon
            :name="themeIcon"
            class="app-header-icon text-gray-40"
            color="currentColor"
          />
        </button>
      </describedby>

      <a
        href="https://github.com/tzuyi0817/PDF-signature"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg-icon
          name="github"
          class="app-header-icon text-gray-40"
        />
      </a>
    </div>
  </header>
</template>

<style lang="css" scoped>
.app-header {
  position: relative;
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
  background-color: var(--color-surface);
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
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--color-surface);
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
    scale 0.2s,
    opacity 0.2s;
}

@media (min-width: 1024px) {
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
