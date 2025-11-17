<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignPassword from '@/components/SignPassword.vue';
import SignPopup from '@/components/SignPopup.vue';
import { useConfigStore } from '@/stores';

interface Emits {
  closePassword: [confirmed?: boolean];
}

const emit = defineEmits<Emits>();
const password = ref('');
const { t } = useI18n();

function confirmPassword() {
  if (!password.value) {
    showToast({ message: t('password_required'), type: 'error' });
    return;
  }
  useConfigStore().updateFilePassword(password.value);
  emit('closePassword', true);
}
</script>

<template>
  <sign-popup :title="$t('warn')">
    <p class="my-5 text-center">
      {{ $t('prompt.protected_file') }}
    </p>
    <sign-password
      v-model="password"
      class="mx-auto mb-4"
      placeholder="placeholder.password"
    />
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn-base"
        @click="emit('closePassword')"
      >
        {{ $t('not_yet') }}
      </button>
      <button
        class="btn btn-primary"
        @click="confirmPassword"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </sign-popup>
</template>
