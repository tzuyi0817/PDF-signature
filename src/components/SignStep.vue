<script setup lang="ts">
interface Props {
  status: 'upload' | 'sign' | 'complete';
}

defineProps<Props>();
</script>

<template>
  <div class="sign-step">
    <div
      :class="[
        'sign-step-dot',
        { 'sign-step-dot-light': status === 'upload' },
        { 'sign-step-dot-complete': status === 'sign' || status === 'complete' },
      ]"
    ></div>
    <div :class="['sign-step-line', status === 'sign' || status === 'complete' ? 'bg-primary' : 'bg-gray-40']"></div>
    <div
      :class="[
        'sign-step-dot',
        { 'sign-step-dot-light': status === 'sign' },
        { 'sign-step-dot-complete': status === 'complete' },
      ]"
    ></div>
    <div :class="['sign-step-line', status === 'complete' ? 'bg-primary' : 'bg-gray-40']"></div>
    <div :class="['sign-step-dot', { 'sign-step-dot-light': status === 'complete' }]"></div>
    <span :class="['sign-step-text -left-5', status === 'upload' ? 'text-primary' : 'text-gray-40']">{{
      $t('upload_file_lower')
    }}</span>
    <span :class="['sign-step-text', status === 'sign' ? 'text-primary' : 'text-gray-40']">{{
      $t('sign_file_lower')
    }}</span>
    <span :class="['sign-step-text -right-5', status === 'complete' ? 'text-primary' : 'text-gray-40']">{{
      $t('sign_completed_lower')
    }}</span>
  </div>
</template>

<style lang="css" scoped>
.sign-step {
  position: relative;
  display: flex;
  padding: 15px 0;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .sign-step {
    position: fixed;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }
}

.sign-step-dot {
  box-sizing: border-box;
  width: 10px;
  height: 10px;
  background-color: black;
  border: 2px solid var(--color-gray-40);
  border-radius: 50%;
}

@media (min-width: 768px) {
  .sign-step-dot {
    width: 1rem;
    height: 1rem;
  }
}

.sign-step-dot-light {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(183, 236, 93, 0.5);
}

.sign-step-dot-complete {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
}

.sign-step-line {
  width: 90px;
  height: 2px;
}

@media (min-width: 768px) {
  .sign-step-line {
    width: 210px;
  }
}

.sign-step-text {
  display: none;
  position: absolute;
  font-size: 14px;
  line-height: 1.25rem;
  top: 40px;
}

@media (min-width: 768px) {
  .sign-step-text {
    display: block;
  }
}
</style>
