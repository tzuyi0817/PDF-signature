<script setup lang="ts">
import { computed, ref } from 'vue';
import { SvgIcon } from '@/components/common';

interface Props {
  placeholder: string;
}

defineProps<Props>();
const password = defineModel({ required: true });
const type = ref('password');
const icon = computed(() => (type.value === 'password' ? 'eye_closed' : 'eye_open'));

function toggleType() {
  type.value = type.value === 'password' ? 'text' : 'password';
}
</script>

<template>
  <label class="relative flex w-full max-w-96 justify-center">
    <input
      v-model="password"
      :type="type"
      class="input-password"
      :placeholder="$t(placeholder)"
    />

    <svg-icon
      :name="icon"
      class="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 md:right-3"
      @click="toggleType"
    />
  </label>
</template>
