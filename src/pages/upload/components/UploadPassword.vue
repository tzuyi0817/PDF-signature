<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignPassword from '@/components/SignPassword.vue';
import SignPopup from '@/components/SignPopup.vue';
import { useConfigStore } from '@/stores';

const emit = defineEmits(['closePassword']);
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
    <p class="text-center my-5">
      {{ $t('prompt.protected_file') }}
    </p>
    <sign-password
      v-model="password"
      class="mb-4 mx-auto"
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
