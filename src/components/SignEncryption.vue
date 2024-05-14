<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SignPopup from '@/components/SignPopup.vue';
import { useConfigStore } from '@/store';
import { downloadPDF } from '@/utils/jspdf';
import toast from '@/utils/toast';
import type { PDF } from '@/types/pdf';

interface Props {
  file: PDF | null;
}

const props = defineProps<Props>();
const emit = defineEmits(['close-encrypt-popup']);
const password = ref('');
const confirmPassword = ref('');
const { t } = useI18n();
const { toggleLoading, setLoadingCompleteness } = useConfigStore();

async function download(isEncrypt: boolean) {
  if (isEncrypt && (!password.value || !confirmPassword.value)) {
    toast.showToast(t('password_required'), 'error');
    return;
  }
  if (isEncrypt && password.value !== confirmPassword.value) {
    toast.showToast(t('password_not_match'), 'error');
    return;
  }
  emit('close-encrypt-popup');
  if (!props.file) return;
  const userPassword = isEncrypt ? password.value : '';

  toggleLoading({ isShow: true, title: 'download', content: 'file_downloading', isProcess: true });
  await downloadPDF(props.file, setLoadingCompleteness, userPassword);
  toggleLoading({ isShow: false });
}
</script>

<template>
  <SignPopup :title="$t('encryption')">
    <p class="text-center my-5">{{ $t('prompt.encryption_file') }}</p>
    <div class="mb-4 flex flex-col justify-center items-center gap-3">
      <input
        v-model="password"
        type="password"
        class="input-password"
        :placeholder="$t('placeholder.password')"
      />
      <input
        v-model="confirmPassword"
        type="password"
        class="input-password"
        :placeholder="$t('placeholder.confirm_password')"
      />
    </div>
    <div class="flex justify-between md:justify-evenly">
      <button
        class="btn btn_base"
        @click="() => download(false)"
      >
        {{ $t('not_yet') }}
      </button>
      <button
        class="btn btn_primary"
        @click="() => download(true)"
      >
        {{ $t('confirm') }}
      </button>
    </div>
  </SignPopup>
</template>
