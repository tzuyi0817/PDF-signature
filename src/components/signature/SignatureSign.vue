<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSignatureStore } from '@/store';
import SignaturePopup from '@/components/signature/SignaturePopup.vue';
import SignatureDrawPopup from '@/components/signature/SignatureDrawPopup.vue';

interface Props {
  isShowSign: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:isShowSign']);
const currentSelect = ref('');
const isShowDrawPopup = ref(false);
const { signatureList } = storeToRefs(useSignatureStore());

function use() {

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
    @use="use"
  >
    <ul v-if="signatureList.length">
      <img
        src="@/assets/icon/ic_add_dark.svg"
        alt=""
        width="60"
        height="60"
        class="iconScale"
        @click="toggleDrawPopup(true)"
      />
      <li v-for="sign in signatureList" :key="sign">

      </li>
    </ul>

    <div v-else class="h-full flex flex-col justify-center items-center">
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
</template>
