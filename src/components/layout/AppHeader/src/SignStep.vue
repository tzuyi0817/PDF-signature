<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isUploadPage = computed(() => route.name === 'upload');
const isSignaturePage = computed(() => route.name === 'signature');
const isCompletePage = computed(() => route.name === 'complete');
</script>

<template>
  <div
    class="sign-step"
    :class="{ 'opacity-0': !isUploadPage && !isSignaturePage && !isCompletePage }"
  >
    <div
      :class="[
        'sign-step-dot',
        { 'sign-step-dot-light': isUploadPage },
        { 'sign-step-dot-complete': isSignaturePage || isCompletePage },
      ]"
    >
      <span :class="['sign-step-text', isUploadPage ? 'text-primary' : 'text-gray-40']">
        {{ $t('upload_file_lower') }}
      </span>
    </div>

    <progress
      class="sign-step-bar"
      :value="isSignaturePage || isCompletePage ? 100 : 0"
      max="100"
    ></progress>

    <div
      :class="[
        'sign-step-dot',
        { 'sign-step-dot-light': isSignaturePage },
        { 'sign-step-dot-complete': isCompletePage },
      ]"
    >
      <span :class="['sign-step-text', isSignaturePage ? 'text-primary' : 'text-gray-40']">
        {{ $t('sign_file_lower') }}
      </span>
    </div>

    <progress
      class="sign-step-bar"
      :value="isCompletePage ? 100 : 0"
      max="100"
    ></progress>

    <div :class="['sign-step-dot', { 'sign-step-dot-light': isCompletePage }]">
      <span :class="['sign-step-text', isCompletePage ? 'text-primary' : 'text-gray-40']">
        {{ $t('sign_completed_lower') }}
      </span>
    </div>
  </div>
</template>

<style lang="css" scoped>
.sign-step {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translate(-50%, 50px);
  padding: 15px 0;
  align-items: center;
  justify-content: center;
  display: flex;
  transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.sign-step-dot {
  position: relative;
  box-sizing: border-box;
  width: 10px;
  height: 10px;
  background-color: black;
  border: 2px solid var(--color-gray-40);
  border-radius: 50%;
}

.sign-step-dot-light {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(183, 236, 93, 0.5);
  transition-property: background-color, border-color, box-shadow;
  transition-delay: 300ms;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

  .sign-step-text {
    transition-delay: 300ms;
  }
}

.sign-step-dot-complete {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  transition-property: background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.sign-step-bar {
  width: 90px;
  height: 2px;
  appearance: none;
}

.sign-step-bar::-webkit-progress-bar {
  background-color: var(--color-gray-40);
}

.sign-step-bar::-webkit-progress-value {
  background-color: var(--color-primary);
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sign-step-text {
  display: none;
  position: absolute;
  font-size: 14px;
  line-height: 20px;
  bottom: -10px;
  left: 50%;
  white-space: nowrap;
  transform: translate(-50%, 100%);
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 768px) {
  .sign-step {
    transform: translate(-50%, 0px);
  }

  .sign-step-dot {
    width: 16px;
    height: 16px;
  }

  .sign-step-bar {
    width: 210px;
  }

  .sign-step-text {
    display: block;
  }
}
</style>
