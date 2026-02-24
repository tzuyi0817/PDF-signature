<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { SvgIcon } from '@/components/common';

interface Props {
  placeholder: string;
  autofocus?: boolean;
}

defineOptions({ name: 'PasswordInput' });

const props = defineProps<Props>();
const password = defineModel({ required: true });
const type = ref('password');
const inputRef = useTemplateRef('inputRef');
const icon = computed(() => (type.value === 'password' ? 'eye_closed' : 'eye_open'));

function toggleType() {
  type.value = type.value === 'password' ? 'text' : 'password';
}

function focusInput() {
  if (!props.autofocus) return;

  inputRef.value?.focus();
}

onMounted(focusInput);
</script>

<template>
  <label class="relative flex w-full max-w-96 justify-center">
    <input
      ref="inputRef"
      v-model="password"
      :type="type"
      class="input-password"
      :placeholder="$t(placeholder)"
    />

    <svg-icon
      :name="icon"
      class="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 lg:right-3"
      @click="toggleType"
    />
  </label>
</template>
