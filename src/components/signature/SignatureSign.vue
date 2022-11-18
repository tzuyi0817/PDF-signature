<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSignatureStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignatureDrawPopup from '@/components/signature/SignatureDrawPopup.vue';
import SignIcon from '@/components/SignIcon.vue';
import useWarnPopup from '@/hooks/useWarnPopup';
import toast from '@/utils/toast';

interface Props {
  isShowSign: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:isShowSign', 'useSignature']);
const currentSelect = ref('');
const isShowDrawPopup = ref(false);
const { signatureList } = storeToRefs(useSignatureStore());
const { isShowWarnPopup, SignPopup, toggleWarnPopup } = useWarnPopup();

function useSignature() {
  emit('useSignature', currentSelect.value);
  close();
}

function selectSignature(signature: string) {
  currentSelect.value = signature;
}

function deleteSignature() {
  useSignatureStore().deleteSignature(currentSelect.value);
  toast.showToast('簽名檔刪除成功', 'success');
  toggleWarnPopup(false);
  currentSelect.value = '';
}

function toggleDrawPopup(isOpen: boolean) {
  isShowDrawPopup.value = isOpen;
}

function close() {
  emit('update:isShowSign', false);
}
</script>

<template>
  <signature-popup
    :isShowPopup="isShowSign" 
    title="簽名檔"
    :isDisabled="!currentSelect"
    @close="close"
    @use="useSignature"
  >
    <ul v-if="signatureList.length" class="signature_sign_content">
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="60"
        height="60"
        class="iconScale mb-3"
        @click="toggleDrawPopup(true)"
      />
      <li
        v-for="signature in signatureList"
        :key="signature"
        @click="selectSignature(signature)"
        :class="[
          'rounded-[20px] relative w-full flex justify-center',
          currentSelect === signature ? 'bg-primary opacity-70' : 'bg-white',
        ]" 
      >
        <img :src="signature" alt="" class="object-contain rounded-[20px]" />
        <sign-icon
          v-show="currentSelect === signature"
          icon="close_s" 
          @click="toggleWarnPopup(true)"
          class="absolute top-1 left-1"
        />
      </li>
    </ul>

    <div v-else class="signature_sign_content justify-center">
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="80"
        height="80"
        class="iconScale mb-5"
        @click="toggleDrawPopup(true)"
      />
      <h5 class="text-secondary">新增簽名檔</h5>
    </div>
  </signature-popup>

  <signature-draw-popup
    v-if="isShowDrawPopup"
    @close="toggleDrawPopup(false)"
  />

  <sign-popup title="警告" v-if="isShowWarnPopup">
    <p class="text-center">確定要刪除此簽名?</p>
    <div class="flex justify-between">
      <button class="btn btn_base" @click="toggleWarnPopup(false)">先不要</button>
      <button class="btn btn_primary" @click="deleteSignature">刪除</button>
    </div>
  </sign-popup>
</template>

<style lang="postcss" scoped>
.signature_sign {
  &_content {
    @apply
    h-full
    overflow-y-auto
    flex
    flex-col
    px-4
    py-5
    gap-2
    items-center;
  }
}
</style>