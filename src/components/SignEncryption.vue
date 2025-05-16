<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { showToast } from '@/components/common';
import SignPassword from '@/components/SignPassword.vue';
import SignPopup from '@/components/SignPopup.vue';
import { useConfigStore } from '@/stores';
import { downloadPDF } from '@/utils/jspdf';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF | null;
}

const { file } = defineProps<Props>();
const emit = defineEmits(['closeEncryptPopup']);
const password = ref('');
const confirmPassword = ref('');
const { t } = useI18n();
const { toggleLoading, setLoadingCompleteness } = useConfigStore();

function download(isEncrypt: boolean) {
  if (isEncrypt && (!password.value || !confirmPassword.value)) {
    showToast({ message: t('password_required'), type: 'error' });
    return;
  }
  if (isEncrypt && password.value !== confirmPassword.value) {
    showToast({ message: t('password_not_match'), type: 'error' });
    return;
  }
  emit('closeEncryptPopup');
  window.requestAnimationFrame(async () => {
    if (!file) return;
    const userPassword = isEncrypt ? password.value : '';

    toggleLoading({ isShow: true, title: 'download', content: 'file_downloading', isProcess: true });
    await downloadPDF(file, setLoadingCompleteness, userPassword);
    toggleLoading({ isShow: false });
  });
}
</script>

<template>
  <SignPopup
    :title="$t('encryption')"
    @close-popup="$emit('closeEncryptPopup')"
  >
    <p class="text-center my-5">
      {{ $t('prompt.encryption_file') }}
    </p>
    <div class="mb-4 flex flex-col justify-center items-center gap-3">
      <sign-password
        v-model="password"
        placeholder="placeholder.password"
      />
      <sign-password
        v-model="confirmPassword"
        placeholder="placeholder.confirm_password"
      />
    </div>
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn-base"
        @click="() => download(false)"
      >
        {{ $t('not_yet') }}
      </button>
      <button
        class="btn btn-primary"
        @click="() => download(true)"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </SignPopup>
</template>
