<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SignPopup from '@/components/SignPopup.vue';
import SignPassword from '@/components/SignPassword.vue';
import { useConfigStore } from '@/store';
import toast from '@/utils/toast';

const emit = defineEmits(['close-password']);
const password = ref('');
const { t } = useI18n();

function confirmPassword() {
  if (!password.value) {
    toast.showToast(t('prompt.password_required'), 'error');
    return;
  }
  useConfigStore().updateFilePassword(password.value);
  emit('close-password', true);
}
</script>

<template>
  <SignPopup :title="$t('warn')">
    <p class="text-center my-5">{{ $t('prompt.protected_file') }}</p>
    <sign-password
      v-model="password"
      class="mb-4 mx-auto"
      placeholder="placeholder.password"
    />
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn_base"
        @click="emit('close-password')"
      >
        {{ $t('not_yet') }}
      </button>
      <button
        class="btn btn_primary"
        @click="confirmPassword"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </SignPopup>
</template>
