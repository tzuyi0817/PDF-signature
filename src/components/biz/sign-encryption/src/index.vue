<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PasswordInput, Popup, showToast } from '@/components/common';
import { useConfigStore } from '@/stores';
import { createDownloadFile } from '@/utils/pdf-download';
import { saveFile } from '@/utils/pdf-download/save-file';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF | null;
}

interface Emits {
  closeEncryptPopup: [];
}

defineOptions({ name: 'SignEncryption' });

const { file } = defineProps<Props>();
const emit = defineEmits<Emits>();
const password = ref('');
const confirmPassword = ref('');
const { t } = useI18n();
const { toggleLoading } = useConfigStore();

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
  requestAnimationFrame(async () => {
    if (!file) return;

    toggleLoading({ isShow: true, title: 'download', content: 'file_downloading' });

    try {
      saveFile(await createDownloadFile(file, isEncrypt ? password.value : undefined));
    } catch {
      showToast({ message: t('prompt.file_download_failed'), type: 'error' });
    } finally {
      toggleLoading({ isShow: false });
    }
  });
}
</script>

<template>
  <popup
    :title="$t('encryption')"
    @close-popup="$emit('closeEncryptPopup')"
  >
    <p class="my-5 text-center">
      {{ $t('prompt.encryption_file') }}
    </p>

    <div class="mb-4 flex flex-col items-center justify-center gap-3">
      <password-input
        v-model="password"
        placeholder="placeholder.password"
        autofocus
      />
      <password-input
        v-model="confirmPassword"
        placeholder="placeholder.confirm_password"
      />
    </div>

    <div class="flex justify-between lg:justify-evenly">
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
  </popup>
</template>
