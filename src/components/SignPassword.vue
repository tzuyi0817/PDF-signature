<script setup lang="ts">
import { computed, ref } from 'vue';
import SignIcon from '@/components/SignIcon.vue';

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
  <label class="relative w-full max-w-96 flex justify-center">
    <input
      v-model="password"
      :type="type"
      class="input-password"
      :placeholder="$t(placeholder)"
    />
    <sign-icon
      :name="icon"
      class="w-6 h-6 absolute top-1/2 right-2 -translate-y-1/2 md:right-3"
      @click="toggleType"
    />
  </label>
</template>
