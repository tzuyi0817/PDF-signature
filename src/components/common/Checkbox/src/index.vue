<script setup lang="ts">
import { useId } from 'vue';

defineOptions({ name: 'Checkbox' });

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

<style lang="css" scoped>
.checkbox-container {
  position: relative;
  cursor: pointer;
  user-select: none;
  width: 16px;
  height: 16px;
}

.checkbox-container .checkmark {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-gray-50);
  border-radius: 2px;
}

.checkbox-container .checkmark::after {
  content: '';
  opacity: 0;
  position: absolute;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border-color: var(--color-gray-50);
  border-style: solid;
}

.checkbox-container.checked .checkmark::after {
  opacity: 1;
  rotate: 45deg;
  border-right-width: 2px;
  border-bottom-width: 2px;
  width: 6px;
  height: 10px;
  top: 0;
  left: 3px;
}

.checkbox-container.mixed .checkmark::after {
  opacity: 1;
  border-top-width: 2px;
  width: 8px;
  top: 5px;
  left: 2px;
}
</style>
