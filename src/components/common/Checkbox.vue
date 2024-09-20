<script setup lang="ts">
import { useId } from 'vue';

const checked = defineModel();
const id = useId();
</script>

<template>
  <label class="checkbox-container">
    <input
      v-model="checked"
      :id
      type="checkbox"
    />
    <span class="checkmark"></span>
  </label>
</template>

<style lang="postcss" scoped>
.checkbox-container {
  @apply relative cursor-pointer select-none w-4 h-4 rounded-sm transition-colors hover:bg-gray-50/20;

  input[type='checkbox'] {
    @apply hidden;
    &:checked ~ .checkmark {
      @apply after:opacity-100;
    }
  }

  .checkmark {
    @apply absolute top-0 left-0 w-4 h-4 border-2 border-gray-50 rounded-sm;
    &:after {
      @apply opacity-0 absolute content-[''] rotate-45 border-r-2 border-b-2 w-1.5 h-2.5 top-0 left-[3px] border-gray-50 transition-[opacity];
    }
  }
}
</style>
