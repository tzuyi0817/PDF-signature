<script setup lang="ts">
import { useId } from 'vue';

const checked = defineModel<boolean | 'mixed'>();
const emit = defineEmits(['change']);
const id = useId();

function onclick() {
  if (checked.value === true || checked.value === 'mixed') {
    checked.value = false;
  } else {
    checked.value = true;
  }
  emit('change', checked.value);
}
</script>

<template>
  <label
    :id
    :class="['checkbox-container', { checked: checked === true, mixed: checked === 'mixed' }]"
    :aria-checked="checked"
    role="checkbox"
    @click="onclick"
  >
    <span class="checkmark"></span>
  </label>
</template>

<style lang="postcss" scoped>
.checkbox-container {
  @apply relative cursor-pointer select-none w-4 h-4;

  &.checked,
  &.mixed {
    .checkmark {
      @apply after:opacity-100;
    }
  }

  &.checked {
    .checkmark {
      &:after {
        @apply rotate-45 border-r-2 border-b-2 w-1.5 h-2.5 top-0 left-[3px];
      }
    }
  }

  &.mixed {
    .checkmark {
      &:after {
        @apply border-t-2 w-2 top-[5px] left-0.5;
      }
    }
  }

  .checkmark {
    @apply absolute top-0 left-0 w-4 h-4 border-2 border-gray-50 rounded-sm;
    &:after {
      @apply opacity-0 absolute content-[''] border-gray-50 transition-[opacity];
    }
  }
}
</style>
