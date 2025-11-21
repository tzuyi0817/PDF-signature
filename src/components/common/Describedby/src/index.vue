<script lang="ts" setup>
import { ref } from 'vue';
import { sleep } from '@/utils/common';

interface Props {
  title?: string;
}

defineOptions({ name: 'Describedby' });

const { title } = defineProps<Props>();
const isShowDescription = ref(false);
const isDisplayDescription = ref(false);
const id = Date.now().toString();
let timer: ReturnType<typeof setTimeout> | null = null;

async function handleMouseEnter() {
  if (!title) return;

  cleanupTimer();
  isDisplayDescription.value = true;
  await sleep(0);
  isShowDescription.value = true;
}

function handleMouseLeave() {
  if (!title) return;

  isShowDescription.value = false;
  cleanupTimer();

  timer = setTimeout(() => {
    isDisplayDescription.value = false;
  }, 300);
}

function cleanupTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
</script>

<template>
  <div
    class="relative"
    :aria-describedby="isDisplayDescription ? id : undefined"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>

    <p
      v-if="isDisplayDescription"
      :id="id"
      :class="['describedby', { 'opacity-0': !isShowDescription }]"
    >
      {{ title }}
    </p>
  </div>
</template>

<style lang="css" scoped>
.describedby {
  background-color: white;
  color: var(--color-gray-90);
  font-size: 12px;
  font-weight: 600;
  line-height: calc(1 / 0.75);
  padding: 4px 8px;
  border: 1px solid var(--color-gray-90);
  border-radius: 6px;
  position: absolute;
  white-space: nowrap;
  left: 50%;
  top: -4px;
  transform: translateX(-50%) translateY(-100%);
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 10;
}
</style>
